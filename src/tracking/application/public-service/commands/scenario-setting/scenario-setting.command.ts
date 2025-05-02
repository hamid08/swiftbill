import { ICommand } from '@nestjs/cqrs';

export class ScenarioSettingCommand implements ICommand {
    constructor(public readonly data: ScenarioSettingCommandModel) { }
}

export interface ScenarioSettingCommandModel {
    dailyRentalFee: number;
    dayStartHour: number;
    dayEndHour: number;
    maxOverstayingDurationDayInMinutes: number;
    maxOverstayingDurationNightInMinutes: number;
    allowedStopTimeInStopForbiddenAreaInMinutes: number;
}