import { Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
    TrackerRepository,
    VehicleRepository,
    TrackerError,
    VehicleError
} from 'src/tracking/domain';
import {
    AppException,
    HTTP_CONSTANT,
    HttpService,
    ResultUtils
} from 'src/common';
import { GetCurrentDriverQuery } from './get-current-driver.query';
import {
    CurrentDriverDto,
    TransportCurrentDriverInfoDto
} from './get-current-driver.models';
import { AppConfigService } from 'src/config';

@QueryHandler(GetCurrentDriverQuery)
export class GetCurrentDriverQueryHandler
    implements IQueryHandler<GetCurrentDriverQuery, CurrentDriverDto | null> {

    private readonly logger = new Logger(GetCurrentDriverQueryHandler.name);

    constructor(
        @Inject(HTTP_CONSTANT.SERVICES.TRANSPORT.SERVICE_NAME)
        private readonly httpTransportService: HttpService,
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        private readonly appConfigService: AppConfigService,
    ) { }

    async execute(query: GetCurrentDriverQuery): Promise<CurrentDriverDto | null> {
        const vehicle = await this.validateAndGetVehicle(query.trackerId);
        const driverInfo = await this.fetchCurrentDriverInfo(vehicle.getExternalId());

        return this.mapToCurrentDriverDto(driverInfo);

    }

    private async validateAndGetVehicle(trackerId: number) {
        const tracker = await this.trackerRepository.getByTrackerId(trackerId);
        if (!tracker) {
            throw AppException.BadRequest(TrackerError.TrackerNotFound);
        }

        const vehicle = await this.vehicleRepository.getVehicleById(tracker.getVehicleId());
        if (!vehicle) {
            throw AppException.BadRequest(VehicleError.VEHICLE_NOT_FOUND);
        }

        return vehicle;
    }

    private async fetchCurrentDriverInfo(
        vehicleId: string
    ): Promise<TransportCurrentDriverInfoDto | null> {
        try {
            const { accessKey } = this.appConfigService.sync.singleEndpoint;
            const url = HTTP_CONSTANT.SERVICES.TRANSPORT.API.GET_CURRENT_DRIVER(vehicleId, accessKey);

            const response = await this.httpTransportService.get<TransportCurrentDriverInfoDto>(url);
            return this.handleApiResponse(response);
        } catch (error) {
            this.logError('Failed to fetch driver from Transport service', error);
            return null;
        }
    }

    private handleApiResponse<T>(response: any): T | null {
        const result = ResultUtils.getOperationResult<T>(response.data);

        if (!result?.success) {
            const errorMessage = result?.messages?.join(' - ') || 'Unknown error';
            this.logger.error(
                `Transport service error: ${errorMessage}`,
                response.config?.url
            );
            return null;
        }

        return result.data || null;
    }

    private mapToCurrentDriverDto(
        driverInfo: TransportCurrentDriverInfoDto | null
    ): CurrentDriverDto {
        return driverInfo
            ? {
                driverName: driverInfo.driverFullName,
                driverAvatar: driverInfo.driverImage
            }
            : null;
    }

    private logError(context: string, error: any): void {
        const errorDetails = error.response?.data
            || error.errors?.[0]?.message
            || error.message;
        this.logger.error(`${context}: ${errorDetails}`);
    }
}