import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackerAssignmentError, TrackerAssignmentRepository, TrackingDataRepository, TrackingDataHistoryTrackedRouteDto, TrackingDataHistoryTrackedParameterDto } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException, DateTimeUtils } from 'src/common';
import { GetDataHistoryTrackedParameterQuery } from './data-history-tracked-parameter.query';

@QueryHandler(GetDataHistoryTrackedParameterQuery)
export class GetDataHistoryTrackedParameterQueryHandler implements IQueryHandler<GetDataHistoryTrackedParameterQuery, TrackingDataHistoryTrackedParameterDto[]> {
    private readonly MAX_ALLOWED_DAYS = 8;
    private readonly DATE_RANGE_ERROR_MESSAGE =
        'بازه زمانی انتخابی نمی‌تواند بیشتر از 8 روز باشد. لطفا بازه زمانی کوچکتری انتخاب کنید.';

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,

        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
    ) { }

    async execute(query: GetDataHistoryTrackedParameterQuery): Promise<TrackingDataHistoryTrackedParameterDto[]> {
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

        return await this.trackingDataRepository.getDataHistoryTrackedParameter(
            query.parameterKey,
            trackerAssignment.getTerminalNumber(),
            query.fromDate,
            query.toDate,
        ) || [];
    }
}