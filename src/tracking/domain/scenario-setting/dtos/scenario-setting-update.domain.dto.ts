export interface ScenarioSettingUpdateDomainDto {
    id:number;
    dailyRentalFee: number;
    dayStartHour: number;
    dayEndHour: number;
    maxOverstayingDurationDayInMinutes: number;
    maxOverstayingDurationNightInMinutes: number;
    allowedStopTimeInStopForbiddenAreaInMinutes: number;
}