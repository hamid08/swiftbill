import { Inject, Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPointDetailsQuery } from './get-point-details.query';
import {
    MinimalLocationB1,
    PointDetailsDto,
    PointDetailVehicleDto,
    TrackerAssignment,
    TrackerAssignmentRepository,
    TrackerLatestDataRepository,
    TrackerRepository,
    TrackingDataRepository,
    Vehicle,
    VehicleRepository
} from 'src/tracking';
import { AppException } from 'src/common';
import { TrackerAssignmentError } from 'src/tracking/domain';

@Injectable()
@QueryHandler(GetPointDetailsQuery)
export class GetPointDetailsQueryHandler implements IQueryHandler<GetPointDetailsQuery, PointDetailsDto> {
    private readonly logger = new Logger(GetPointDetailsQueryHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackerLatestDataRepository)
        private readonly trackerLatestDataRepository: TrackerLatestDataRepository,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
    ) { }

    async execute(query: GetPointDetailsQuery): Promise<PointDetailsDto> {
        const { assignmentId, latitude, longitude } = query;

        const trackerAssignment = await this.getTrackerAssignment(assignmentId);
        const location = await this.getLocationDetails(trackerAssignment, latitude, longitude);
        const vehicle = await this.getVehicleDetails(trackerAssignment);

        return {
            location,
            vehicle,
            currentTrip: null // TODO: Implement trip details fetching
        };
    }

    private async getTrackerAssignment(assignmentId: number): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(assignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        return trackerAssignment;
    }

    private async getLocationDetails(
        trackerAssignment: TrackerAssignment,
        latitude: number,
        longitude: number,
    ): Promise<MinimalLocationB1 | null> {
        return this.trackingDataRepository.getPointDetails(
            trackerAssignment.getTerminalNumber(),
            latitude,
            longitude,
        );
    }

    private async getVehicleDetails(trackerAssignment: TrackerAssignment): Promise<PointDetailVehicleDto> {

        var tracker = await this.trackerRepository.getByTrackerId(trackerAssignment.getTrackerId());
        if (!tracker) return;

        const vehicle: Vehicle | null = await this.vehicleRepository.getVehicleById(tracker.getVehicleId());

        if (!vehicle) {
            return null;
        }

        return {
            plaqueNo: vehicle.getPlaqueNo(),
            plaqueType: vehicle.getPlaqueType(),
            plaqueStatus: vehicle.getPlaqueStatus(),
        };
    }
}