import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    TrackingDataRepository,
    PublicTrackingDataResponseDto,
    VehicleRepository,
    Vehicle,
    VehicleError,
    TrackerAssignmentRepository,
    PublicTrackingDataDto,
    LocationType
} from "src/tracking/domain";
import { GetPublicTrackingDataQuery } from "./get-public-tracking-data.query";
import { AppException } from "src/common";

@QueryHandler(GetPublicTrackingDataQuery)
@Injectable()
export class GetPublicTrackingDataQueryHandler
    implements IQueryHandler<GetPublicTrackingDataQuery, PublicTrackingDataResponseDto> {
    
    private readonly logger = new Logger(GetPublicTrackingDataQueryHandler.name);

    constructor(
        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: GetPublicTrackingDataQuery): Promise<PublicTrackingDataResponseDto> {
        try {
            const { fromDate, identifier, type, limit, page, toDate } = query;

            switch (type) {
                case "device":
                    return await this.handleDeviceTrackingRequest(identifier, page, limit, fromDate, toDate);
                case "vehicle":
                    return await this.handleVehicleTrackingRequest(identifier, page, limit, fromDate, toDate);
                default:
                    this.logger.warn(`Invalid tracking data type requested: ${type}`);
                    return this.createEmptyResponse();
            }
        } catch (error) {
            this.logger.error(`Error processing tracking data request: ${error.message}`, error.stack);
            throw AppException.InternalServerError(error.message);
        }
    }

    private async handleDeviceTrackingRequest(
        imei: string,
        page: number,
        limit: number,
        fromDate: Date,
        toDate: Date
    ): Promise<PublicTrackingDataResponseDto> {
        return this.trackingDataRepository.getPublicTrackingDataWithImei(
            imei,
            page,
            limit,
            fromDate,
            toDate
        );
    }

    private async handleVehicleTrackingRequest(
        vehicleIdentity: string,
        page: number,
        limit: number,
        fromDate: Date,
        toDate: Date
    ): Promise<PublicTrackingDataResponseDto> {
        const vehicle = await this.vehicleRepository.getVehicleByIdentity(vehicleIdentity);
        if (!vehicle) {
            throw AppException.BadRequest(VehicleError.VEHICLE_NOT_FOUND);
        }

        const assignment = await this.trackerAssignmentRepository.findActiveDefaultAssignmentByVehicleId(vehicle.getId());
        if (!assignment) {
            this.logger.warn(`No active assignment found for vehicle: ${vehicleIdentity}`);
            return this.createEmptyResponse();
        }

        return this.trackingDataRepository.getPublicTrackingDataWithTerminalNumber(
            assignment.getTerminalNumber(),
            page,
            limit,
            fromDate,
            toDate
        );
    }

    private createEmptyResponse(): PublicTrackingDataResponseDto {
        return {
            list: [],
            page: 1,
            total: 0,
            totalPages: 0
        };
    }
}