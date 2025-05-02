export interface ApplicationSettingCreateDomainDto {
    maxTimeBetweenTripInMinutes: number;
    maxDistanceBetweenPositionsInMeters: number;
    minTimeToDetectConnectedTracker: number;
    maxOverspeedDurationSeconds: number;
    minAllowedSpeedKmPerHour: number;
    faultDataMaxAllowedSpeedKmPerHour: number;
    faultDataMinPointDistanceKm: number;
    missingDataDetectionTimeMinutes: number;
}