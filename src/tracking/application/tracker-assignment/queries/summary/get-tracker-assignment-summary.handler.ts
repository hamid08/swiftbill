import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RelativeTimePeriod, TrackerAssignmentError, TrackerAssignmentRepository, TrackerAssignmentSummaryDto, TrackingDataHistoryTrackedRouteSummaryDto, TrackingDataRepository } from 'src/tracking/domain';
import { Inject, Logger } from '@nestjs/common';
import { AppException } from 'src/common';
import { GetTrackerAssignmentSummaryQuery } from './get-tracker-assignment-summary.query';


@QueryHandler(GetTrackerAssignmentSummaryQuery)
export class GetTrackerAssignmentSummaryQueryHandler implements IQueryHandler<GetTrackerAssignmentSummaryQuery, TrackerAssignmentSummaryDto> {
    private readonly logger = new Logger(GetTrackerAssignmentSummaryQueryHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,

        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
    ) { }

    async execute(query: GetTrackerAssignmentSummaryQuery): Promise<TrackerAssignmentSummaryDto> {

        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackingAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const dateRange = this.getDateRangeForPeriod(query.period);

        const summary: TrackingDataHistoryTrackedRouteSummaryDto = await this.trackingDataRepository.getDataHistoryTrackedRouteSummary(
            dateRange.startDate,
            dateRange.endDate,
            trackerAssignment.getTerminalNumber()
        );

        return {
            summaryDetail: summary.summaryDetail
        };
    }

    private getDateRangeForPeriod(period: RelativeTimePeriod): { startDate: Date; endDate: Date } {
        const now = new Date();
        const endDate = new Date(now.setHours(23, 59, 59, 999)); // End of today

        let startDate = new Date();

        switch (period) {
            case RelativeTimePeriod.Today:
                startDate.setHours(0, 0, 0, 0);
                break;
            case RelativeTimePeriod.PastWeek:
                startDate.setDate(startDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case RelativeTimePeriod.PastMonth:
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case RelativeTimePeriod.PastThreeMonths:
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setHours(0, 0, 0, 0);
                break;
            case RelativeTimePeriod.PastSixMonths:
                startDate.setMonth(startDate.getMonth() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
            default:
                throw new Error('Invalid time period specified');
        }

        return { startDate, endDate };
    }
}   