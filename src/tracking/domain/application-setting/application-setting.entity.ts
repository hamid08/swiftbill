import { Entity } from "src/common";
import {  ApplicationSettingDomainDto, ApplicationSettingCreateDomainDto, ApplicationSettingUpdateDomainDto } from "./dtos";

export class ApplicationSetting extends Entity {

    private maxTimeBetweenTripInMinutes: number;
    private maxDistanceBetweenPositionsInMeters: number;
    private minTimeToDetectConnectedTracker: number;
    private maxOverspeedDurationSeconds: number; // Maximum time in seconds for overspeeding
    private minAllowedSpeedKmPerHour: number;  // Minimum allowed speed in km/h
    private faultDataMaxAllowedSpeedKmPerHour: number; // Maximum allowed speed (in km/h)
    private faultDataMinPointDistanceKm: number; // Minimum distance between points (in km)
    private missingDataDetectionTimeMinutes: number; // Minimum time to detect missing data (in minutes)

    private constructor() {
        super();
    }

    //#region Static Factory Methods

    /**
     * Update a default ApplicationSetting .
     */
    public static update(settings: ApplicationSettingUpdateDomainDto): ApplicationSetting {
        const setting = new ApplicationSetting();

        setting.setId(settings.id);
        setting.setMaxTimeBetweenTripInMinutes(settings.maxTimeBetweenTripInMinutes);
        setting.setMaxDistanceBetweenPositionsInMeters(settings.maxDistanceBetweenPositionsInMeters);
        setting.setMinTimeToDetectConnectedTracker(settings.minTimeToDetectConnectedTracker);
        setting.setMaxOverspeedDurationSeconds(settings.maxOverspeedDurationSeconds);
        setting.setMinAllowedSpeedKmPerHour(settings.minAllowedSpeedKmPerHour);
        setting.setFaultDataMaxAllowedSpeedKmPerHour(settings.faultDataMaxAllowedSpeedKmPerHour);
        setting.setFaultDataMinPointDistanceKm(settings.faultDataMinPointDistanceKm);
        setting.setMissingDataDetectionTimeMinutes(settings.missingDataDetectionTimeMinutes);

        return setting;
    }

    /**
     * Creates a new ApplicationSetting instance.
     */
    public static create(settings: ApplicationSettingCreateDomainDto): ApplicationSetting {
        const setting = new ApplicationSetting();

        setting.setMaxTimeBetweenTripInMinutes(settings.maxTimeBetweenTripInMinutes);
        setting.setMaxDistanceBetweenPositionsInMeters(settings.maxDistanceBetweenPositionsInMeters);
        setting.setMinTimeToDetectConnectedTracker(settings.minTimeToDetectConnectedTracker);
        setting.setMaxOverspeedDurationSeconds(settings.maxOverspeedDurationSeconds);
        setting.setMinAllowedSpeedKmPerHour(settings.minAllowedSpeedKmPerHour);
        setting.setFaultDataMaxAllowedSpeedKmPerHour(settings.faultDataMaxAllowedSpeedKmPerHour);
        setting.setFaultDataMinPointDistanceKm(settings.faultDataMinPointDistanceKm);
        setting.setMissingDataDetectionTimeMinutes(settings.missingDataDetectionTimeMinutes);

        return setting;
    }

    /**
     * Maps a DTO to a domain entity.
     */
    public static mapToDomain(dto: ApplicationSettingDomainDto): ApplicationSetting {
        const setting = new ApplicationSetting();

        setting.setId(dto.id);
        setting.setMaxTimeBetweenTripInMinutes(dto.maxTimeBetweenTripInMinutes);
        setting.setMaxDistanceBetweenPositionsInMeters(dto.maxDistanceBetweenPositionsInMeters);
        setting.setMinTimeToDetectConnectedTracker(dto.minTimeToDetectConnectedTracker);
        setting.setMaxOverspeedDurationSeconds(dto.maxOverspeedDurationSeconds);
        setting.setMinAllowedSpeedKmPerHour(dto.minAllowedSpeedKmPerHour);
        setting.setFaultDataMaxAllowedSpeedKmPerHour(dto.faultDataMaxAllowedSpeedKmPerHour);
        setting.setFaultDataMinPointDistanceKm(dto.faultDataMinPointDistanceKm);
        setting.setMissingDataDetectionTimeMinutes(dto.missingDataDetectionTimeMinutes);

        return setting;
    }

    //#endregion

    //#region Set Values

    public setMissingDataDetectionTimeMinutes(value: number): void {
        this.missingDataDetectionTimeMinutes = value;
    }

    public setFaultDataMinPointDistanceKm(value: number): void {
        this.faultDataMinPointDistanceKm = value;
    }

    public setFaultDataMaxAllowedSpeedKmPerHour(value: number): void {
        this.faultDataMaxAllowedSpeedKmPerHour = value;
    }

    public setMaxTimeBetweenTripInMinutes(value: number): void {
        this.maxTimeBetweenTripInMinutes = value;
    }

    public setMaxDistanceBetweenPositionsInMeters(value: number): void {
        this.maxDistanceBetweenPositionsInMeters = value;
    }

    public setMinTimeToDetectConnectedTracker(value: number): void {
        this.minTimeToDetectConnectedTracker = value;
    }

    public setMaxOverspeedDurationSeconds(value: number): void {
        this.maxOverspeedDurationSeconds = value;
    }

    public setMinAllowedSpeedKmPerHour(value: number): void {
        this.minAllowedSpeedKmPerHour = value;
    }

    //#endregion

    //#region Get Values

    public getMaxTimeBetweenTripInMinutes(): number {
        return this.maxTimeBetweenTripInMinutes;
    }

    public getMaxDistanceBetweenPositionsInMeters(): number {
        return this.maxDistanceBetweenPositionsInMeters;
    }

    public getMinTimeToDetectConnectedTracker(): number {
        return this.minTimeToDetectConnectedTracker;
    }

    public getMaxOverspeedDurationSeconds(): number {
        return this.maxOverspeedDurationSeconds;
    }

    public getMinAllowedSpeedKmPerHour(): number {
        return this.minAllowedSpeedKmPerHour;
    }

    public getFaultDataMaxAllowedSpeedKmPerHour(): number {
        return this.faultDataMaxAllowedSpeedKmPerHour;
    }

    public getFaultDataMinPointDistanceKm(): number {
        return this.faultDataMinPointDistanceKm;
    }

    public getMissingDataDetectionTimeMinutes(): number {
        return this.missingDataDetectionTimeMinutes;
    }

    //#endregion
}