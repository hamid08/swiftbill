import { Entity, GeoUtils } from "src/common";
import { TrackerType } from "../enums";
import { Point } from "typeorm";
import { TrackerLatestDataUpsertDomainDto, TrackerLatestDataDomainDto, TrackerLatestDataUpsertWithTerminalNumberDomainDto } from "./dtos";

export class TrackerLatestData extends Entity {
    private lastTrackedAt?: Date;
    private lastConnectedAt?: Date;
    private location?: Point;
    private angle?: number;
    private altitude?: number;
    private speed?: number;
    private trackerAssignmentId: number;
    private extensionId?: number;

    private constructor() {
        super();
    }

    //#region Factory Methods

    /**
     * Maps a DTO to a TrackerLatestData domain entity.
     * @param dto - Data transfer object.
     * @returns A TrackerLatestData instance.
     */
    public static mapToDomain(dto: TrackerLatestDataDomainDto): TrackerLatestData {
        const trackerLatestData = new TrackerLatestData();

        trackerLatestData.setId(dto.id);
        trackerLatestData.setLastTrackedAt(dto.lastTrackedAt);
        trackerLatestData.setLastConnectedAt(dto.lastConnectedAt);
        trackerLatestData.setLocation(dto.location);
        trackerLatestData.setAngle(dto.angle);
        trackerLatestData.setAltitude(dto.altitude);
        trackerLatestData.setSpeed(dto.speed);
        trackerLatestData.setTrackerAssignmentId(dto.trackerAssignmentId);
        trackerLatestData.setExtensionId(dto.extensionId);

        return trackerLatestData;
    }

    /**
     * Upserts the TrackerLatestData with new values from a DTO.
     * @param dto - Data transfer object for updating TrackerLatestData.
     * @returns A TrackerLatestData instance.
     */
    public static upsert(dto: TrackerLatestDataUpsertDomainDto): TrackerLatestData {
        const trackerLatestData = new TrackerLatestData();

        trackerLatestData.setLastTrackedAt(dto.lastTrackedAt);
        trackerLatestData.setLastConnectedAt(dto.lastConnectedAt);

        // Convert latitude and longitude to a Point object
        if (dto.latitude && dto.longitude) {
            trackerLatestData.setLocation(GeoUtils.latLngToPoint(dto.latitude, dto.longitude));
        }

        trackerLatestData.setAngle(dto.angle);
        trackerLatestData.setAltitude(dto.altitude);
        trackerLatestData.setSpeed(dto.speed);
        trackerLatestData.setTrackerAssignmentId(dto.trackerAssignmentId);
        trackerLatestData.setExtensionId(dto.extensionId);

        return trackerLatestData;
    }

    public static upsertWithTerminalNumber(dto: TrackerLatestDataUpsertWithTerminalNumberDomainDto): TrackerLatestData {
        const trackerLatestData = new TrackerLatestData();

        trackerLatestData.setLastTrackedAt(dto.lastTrackedAt);
        trackerLatestData.setLastConnectedAt(dto.lastConnectedAt);

        // Convert latitude and longitude to a Point object
        if (dto.latitude && dto.longitude) {
            trackerLatestData.setLocation(GeoUtils.latLngToPoint(dto.latitude, dto.longitude));
        }

        trackerLatestData.setAngle(dto.angle);
        trackerLatestData.setAltitude(dto.altitude);
        trackerLatestData.setSpeed(dto.speed);
        trackerLatestData.setExtensionId(dto.extensionId);

        return trackerLatestData;
    }



    //#endregion

    //#region Setters

    public setLastTrackedAt(value?: Date): void {
        this.lastTrackedAt = value;
    }

    public setLastConnectedAt(value?: Date): void {
        this.lastConnectedAt = value;
    }

    public setLocation(value?: Point): void {
        this.location = value;
    }

    public setAngle(value: number): void {
        this.angle = value;
    }

    public setAltitude(value: number): void {
        this.altitude = value;
    }

    public setSpeed(value: number): void {
        this.speed = value;
    }

    public setTrackerAssignmentId(value: number): void {
        this.trackerAssignmentId = value;
    }

    public setExtensionId(value?: number): void {
        this.extensionId = value;
    }

    //#endregion

    //#region Getters

    public getLastTrackedAt(): Date | undefined {
        return this.lastTrackedAt;
    }

    public getLastConnectedAt(): Date | undefined {
        return this.lastConnectedAt;
    }

    public getLocation(): Point | undefined {
        return this.location;
    }

    public getAngle(): number {
        return this.angle;
    }

    public getAltitude(): number {
        return this.altitude;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public getTrackerAssignmentId(): number {
        return this.trackerAssignmentId;
    }

    public getExtensionId(): number | undefined {
        return this.extensionId;
    }

    /**
     * Gets the latitude and longitude from the location.
     * @returns An object containing latitude and longitude, or undefined if location is not set.
     */
    public getLatLng(): { latitude: number; longitude: number } | undefined {
        if (!this.location) {
            return undefined;
        }
        return GeoUtils.pointToLatLng(this.location);
    }

    //#endregion
}