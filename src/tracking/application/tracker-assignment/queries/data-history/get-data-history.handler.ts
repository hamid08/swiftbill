import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ApplicationSettingRepository, TimeSegment, TrackerAssignmentError, TrackerAssignmentRepository, TrackingDataHistoryDto, TrackingDataRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException, DateTimeUtils, GridViewDto } from 'src/common';
import { GetDataHistoryQuery } from './get-data-history.query';

@QueryHandler(GetDataHistoryQuery)
export class GetDataHistoryQueryHandler implements IQueryHandler<GetDataHistoryQuery, GridViewDto<TrackingDataHistoryDto>> {
  private readonly MAX_ALLOWED_DAYS = 8;
  private readonly DATE_RANGE_ERROR_MESSAGE =
    'بازه زمانی انتخابی نمی‌تواند بیشتر از 8 روز باشد. لطفا بازه زمانی کوچکتری انتخاب کنید.';
  constructor(
    @Inject(TrackerAssignmentRepository)
    private readonly trackerAssignmentRepository: TrackerAssignmentRepository,

    @Inject(TrackingDataRepository)
    private readonly trackingDataRepository: TrackingDataRepository,

    @Inject(ApplicationSettingRepository)
    private readonly applicationSettingsRepository: ApplicationSettingRepository,
  ) { }

  async execute(query: GetDataHistoryQuery): Promise<GridViewDto<TrackingDataHistoryDto>> {
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

    const applicationSettings = await this.applicationSettingsRepository.getApplicationSetting();

    const maxTimeBetweenTripInMinutes = applicationSettings && applicationSettings.getMaxTimeBetweenTripInMinutes() || 10;
    const maxDistanceBetweenPositionsInMeters = applicationSettings && applicationSettings.getMaxDistanceBetweenPositionsInMeters() || 500;

    let timeSegments: TimeSegment[] = [];

    if (query.fromTime && query.toTime) {
      const [fromHour, fromMinute] = query.fromTime.split(':').map(Number);
      const [toHour, toMinute] = query.toTime.split(':').map(Number);

      timeSegments = [{
        fromHour,
        toHour: toHour === 0 ? 24 : toHour,
        fromMinute,
        toMinute
      }];
    } else {
      timeSegments = [
        { fromHour: 0, toHour: 6 },
        { fromHour: 6, toHour: 12 },
        { fromHour: 12, toHour: 18 },
        { fromHour: 18, toHour: 24 },
      ];
    }

    return await this.trackingDataRepository.getDataHistory(
      trackerAssignment.getTerminalNumber(),
      maxTimeBetweenTripInMinutes,
      maxDistanceBetweenPositionsInMeters,
      query.fromDate,
      query.toDate,
      query.fromTime,
      query.toTime,
      timeSegments
    );
  }
}