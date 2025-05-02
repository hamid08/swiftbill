import { MinimalLocationB2 } from "../../common";

export class TrackingDataHistoryTrackedRouteDto {
    points: MinimalLocationB2[];
    summaryDetail: TrackingDataHistoryTrackedRouteAttribute[];
    duration: number;
}

export class TrackingDataHistoryTrackedRouteAttribute {
    key: 'مسافت کل' | 'مدت توقف' | 'ساعات کار' | 'زمان فعالیت';
    value: string;
}

export class TrackingDataHistoryTrackedRouteSummaryDto {
    summaryDetail: TrackingDataHistoryTrackedRouteAttribute[];
    duration: number;
}
