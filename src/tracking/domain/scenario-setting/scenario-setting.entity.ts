import { Entity } from "src/common";
import { ScenarioSettingDomainDto, ScenarioSettingCreateDomainDto, ScenarioSettingUpdateDomainDto } from "./dtos";

export class ScenarioSetting extends Entity {
    private dailyRentalFee: number;  // Fee for renting a tracker per day
    private dayStartHour: number;  // Hour the day starts (24-hour format)
    private dayEndHour: number;  // Hour the day ends (24-hour format)
    private maxOverstayingDurationDayInMinutes: number;  // Maximum allowed overstaying during the day (in minutes)
    private maxOverstayingDurationNightInMinutes: number;  // Maximum allowed overstaying during the night (in minutes)
    private allowedStopTimeInStopForbiddenAreaInMinutes: number; // Duration of allowed stop in a forbidden stop zone

    private constructor() {
        super();
    }

    //#region Static Factory Methods

    /**
     * Updates an existing ScenarioSetting instance.
     */
    public static update(settings: ScenarioSettingUpdateDomainDto): ScenarioSetting {
        const setting = new ScenarioSetting();

        setting.setId(settings.id);
        setting.setDailyRentalFee(settings.dailyRentalFee);
        setting.setDayStartHour(settings.dayStartHour);
        setting.setDayEndHour(settings.dayEndHour);
        setting.setMaxOverstayingDurationDayInMinutes(settings.maxOverstayingDurationDayInMinutes);
        setting.setMaxOverstayingDurationNightInMinutes(settings.maxOverstayingDurationNightInMinutes);
        setting.setAllowedStopTimeInStopForbiddenAreaInMinutes(settings.allowedStopTimeInStopForbiddenAreaInMinutes);

        return setting;
    }

    /**
     * Creates a new ScenarioSetting instance.
     */
    public static create(settings: ScenarioSettingCreateDomainDto): ScenarioSetting {
        const setting = new ScenarioSetting();

        setting.setDailyRentalFee(settings.dailyRentalFee);
        setting.setDayStartHour(settings.dayStartHour);
        setting.setDayEndHour(settings.dayEndHour);
        setting.setMaxOverstayingDurationDayInMinutes(settings.maxOverstayingDurationDayInMinutes);
        setting.setMaxOverstayingDurationNightInMinutes(settings.maxOverstayingDurationNightInMinutes);
        setting.setAllowedStopTimeInStopForbiddenAreaInMinutes(settings.allowedStopTimeInStopForbiddenAreaInMinutes);

        return setting;
    }

    /**
     * Maps a DTO to a domain entity.
     */
    public static mapToDomain(dto: ScenarioSettingDomainDto): ScenarioSetting {
        const setting = new ScenarioSetting();

        setting.setId(dto.id);
        setting.setDailyRentalFee(dto.dailyRentalFee);
        setting.setDayStartHour(dto.dayStartHour);
        setting.setDayEndHour(dto.dayEndHour);
        setting.setMaxOverstayingDurationDayInMinutes(dto.maxOverstayingDurationDayInMinutes);
        setting.setMaxOverstayingDurationNightInMinutes(dto.maxOverstayingDurationNightInMinutes);
        setting.setAllowedStopTimeInStopForbiddenAreaInMinutes(dto.allowedStopTimeInStopForbiddenAreaInMinutes);

        return setting;
    }

    //#endregion

    //#region Setters

    public setDailyRentalFee(value: number): void {
        this.dailyRentalFee = value;
    }


    public setDayStartHour(value: number): void {
        this.dayStartHour = value;
    }

    public setDayEndHour(value: number): void {
        this.dayEndHour = value;
    }

    public setMaxOverstayingDurationDayInMinutes(value: number): void {
        this.maxOverstayingDurationDayInMinutes = value;
    }

    public setMaxOverstayingDurationNightInMinutes(value: number): void {
        this.maxOverstayingDurationNightInMinutes = value;
    }

    public setAllowedStopTimeInStopForbiddenAreaInMinutes(value: number): void {
        this.allowedStopTimeInStopForbiddenAreaInMinutes = value;
    }

    //#endregion

    //#region Getters

    public getDailyRentalFee(): number {
        return this.dailyRentalFee;
    }

    public getDayStartHour(): number {
        return this.dayStartHour;
    }

    public getDayEndHour(): number {
        return this.dayEndHour;
    }

    public getMaxOverstayingDurationDayInMinutes(): number {
        return this.maxOverstayingDurationDayInMinutes;
    }

    public getMaxOverstayingDurationNightInMinutes(): number {
        return this.maxOverstayingDurationNightInMinutes;
    }

    public getAllowedStopTimeInStopForbiddenAreaInMinutes(): number {
        return this.allowedStopTimeInStopForbiddenAreaInMinutes;
    }

    //#endregion
}