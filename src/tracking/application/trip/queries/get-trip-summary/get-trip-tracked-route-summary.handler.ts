import { Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
    TrackerAssignment, TrackerAssignmentError, TrackerAssignmentRepository,
    TrackingDataHistoryTrackedRouteSummaryDto, TrackingDataRepository, Trip
} from 'src/tracking/domain';
import { TripRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { GetTripTrackedRouteSummaryQuery } from './get-trip-tracked-route-summary.query';
import { AppException } from 'src/common';


@QueryHandler(GetTripTrackedRouteSummaryQuery)
export class GetTripTrackedRouteSummaryQueryHandler implements IQueryHandler<GetTripTrackedRouteSummaryQuery, TrackingDataHistoryTrackedRouteSummaryDto> {

    private readonly logger = new Logger(GetTripTrackedRouteSummaryQueryHandler.name);

    constructor(
        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
    ) { }

    async execute(query: GetTripTrackedRouteSummaryQuery): Promise<TrackingDataHistoryTrackedRouteSummaryDto> {
        const { trackerAssignmentId, tripId } = query;

        const trackerAssignment = await this.validateTrackerAssignment(trackerAssignmentId);
        const trip: Trip | null = await this.tripRepository.getTripById(tripId);

        if (!trip) {
            this.logger.warn(`Trip not found with id: ${tripId}`);
            return new TrackingDataHistoryTrackedRouteSummaryDto();
        }

        const result: TrackingDataHistoryTrackedRouteSummaryDto = await this.trackingDataRepository.getDataHistoryTrackedRouteSummary(
            trip.getStartDate(),
            trip.getEndDate() || new Date(),
            trackerAssignment.getTerminalNumber(),
        );

        return result;
    }

    private async validateTrackerAssignment(trackerAssignmentId: number): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(trackerAssignmentId);
        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }
        return trackerAssignment;
    }
}