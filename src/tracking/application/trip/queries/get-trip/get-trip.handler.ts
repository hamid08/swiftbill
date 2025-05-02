import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackerAssignment, TrackerAssignmentError, TrackerAssignmentRepository, TripRouteResponseDto } from 'src/tracking/domain';
import { GetTripQuery } from './get-trip.query';
import { TripRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException } from 'src/common';


@QueryHandler(GetTripQuery)
export class GetTripQueryHandler implements IQueryHandler<GetTripQuery, TripRouteResponseDto | null> {
    constructor(
        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: GetTripQuery): Promise<TripRouteResponseDto | null> {
        const { fetchCurrentTrip, tripId, trackerAssignmentId } = query;

        const trackerAssignment: TrackerAssignment | null = await this.trackerAssignmentRepository.getByTrackerAssignmentId(trackerAssignmentId);
        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        if (fetchCurrentTrip) {
            return this.tripRepository.findCurrentTripRoute(trackerAssignment.getTrackerId());
        }

        return this.tripRepository.findTripRouteById(query.tripId);
    }
}