export interface ApplicationSettingUpdateDomainDto {
    id:number;
    maxTimeBetweenTripInMinutes: number;
    maxDistanceBetweenPositionsInMeters: number;
    minTimeToDetectConnectedTracker: number;
    maxOverspeedDurationSeconds: number;
    minAllowedSpeedKmPerHour: number;
    faultDataMaxAllowedSpeedKmPerHour: number;
    faultDataMinPointDistanceKm: number;
    missingDataDetectionTimeMinutes: number;
}