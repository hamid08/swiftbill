export interface ScenarioSettingCreateDomainDto {
    dailyRentalFee: number;
    dayStartHour: number;
    dayEndHour: number;
    maxOverstayingDurationDayInMinutes: number;
    maxOverstayingDurationNightInMinutes: number;
    allowedStopTimeInStopForbiddenAreaInMinutes: number;
}