export class TrackerAssignmentSummaryDto {
    summaryDetail: TrackerAssignmentSummaryAttribute[];
}

export class TrackerAssignmentSummaryAttribute {
    key: 'مسافت کل' | 'مدت توقف' | 'ساعات کار' | 'زمان فعالیت';
    value: string;
}
