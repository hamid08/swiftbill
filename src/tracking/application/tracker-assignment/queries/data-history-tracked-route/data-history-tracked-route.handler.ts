import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackerAssignmentError, TrackerAssignmentRepository, TrackingDataRepository, TrackingDataHistoryTrackedRouteDto } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException, DateTimeUtils } from 'src/common';
import { GetDataHistoryTrackedRouteQuery } from './data-history-tracked-route.query';

@QueryHandler(GetDataHistoryTrackedRouteQuery)
export class GetDataHistoryTrackedRouteQueryHandler implements IQueryHandler<GetDataHistoryTrackedRouteQuery, TrackingDataHistoryTrackedRouteDto> {
    private readonly MAX_ALLOWED_DAYS = 8;
    private readonly DATE_RANGE_ERROR_MESSAGE =
        'بازه زمانی انتخابی نمی‌تواند بیشتر از 8 روز باشد. لطفا بازه زمانی کوچکتری انتخاب کنید.';

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,

        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
    ) { }

    async execute(query: GetDataHistoryTrackedRouteQuery): Promise<TrackingDataHistoryTrackedRouteDto> {
        // Validate date range
        DateTimeUtils.validateDateRange(
            query.fromDate,
            query.toDate,
            this.MAX_ALLOWED_DAYS,
            this.DATE_RANGE_ERROR_MESSAGE
        );

        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackingAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        return await this.trackingDataRepository.getDataHistoryTrackedRoute(
            query.fromDate,
            query.toDate,
            trackerAssignment.getTerminalNumber()
        );
    }
}