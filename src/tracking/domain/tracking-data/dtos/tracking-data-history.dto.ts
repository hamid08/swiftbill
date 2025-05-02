export interface TimeSegment {
    fromHour: number;
    toHour: number;
    fromMinute?: number;
    toMinute?: number;
}

export class TrackingDataHistoryDto {
    /**
     * شناسه رکورد / Record ID
     */
    id: string;

    /**
     * از تاریخ / Start Date
     */
    startDate?: Date;

    /**
     * تا تاریخ / End Date
     */
    endDate?: Date;

    /**
     * مدت کارکرد (ساعت) / Operation Duration (hours)
     */
    operationHours: number;

    /**
     * کیلومتر پیموده شده (km) / Traveled Distance (km)
     */
    distanceKm: number;

    /**
     * میانگین سرعت (km/h) / Average Speed (km/h)
     */
    averageSpeedKmh: number;
}
