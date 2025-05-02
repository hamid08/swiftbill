import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MovementParameterStatistics, TrackerAssignmentError, TrackerAssignmentMovementSummaryDto, TrackerAssignmentRepository, TrackerAssignmentSummaryDto, TrackingDataHistoryTrackedRouteSummaryDto, TrackingDataRepository } from 'src/tracking/domain';
import { Inject, Logger } from '@nestjs/common';
import { AppException } from 'src/common';
import { GetTrackerAssignmentMovementSummaryQuery } from './get-tracker-assignment-movement-summary.query';


@QueryHandler(GetTrackerAssignmentMovementSummaryQuery)
export class GetTrackerAssignmentMovementSummaryQueryHandler implements
    IQueryHandler<GetTrackerAssignmentMovementSummaryQuery, TrackerAssignmentMovementSummaryDto> {
    private readonly logger = new Logger(GetTrackerAssignmentMovementSummaryQueryHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,

        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
    ) { }

    async execute(query: GetTrackerAssignmentMovementSummaryQuery): Promise<TrackerAssignmentMovementSummaryDto> {

        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackingAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        //TODO:Impliment Soon

        return {
            engine_rpm: new MovementParameterStatistics(),
            fuel_rate: new MovementParameterStatistics(),
            speed: new MovementParameterStatistics(),
        };
    }
}   