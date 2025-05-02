import { Entity, GeoUtils } from "src/common";
import { TrackerType } from "../enums";
import { TrackerCreateDomainDto, TrackerDomainDto } from "./dtos";
import { TrackerUpdateLocationDomainDto } from "./dtos/tracker-update-location.domain.dto";
import { Point } from "typeorm";

export class Tracker extends Entity {
    private type: TrackerType;
    private businessId: number;
    private vehicleId?: number;
    private lastTrackedAt?: Date;
    private lastConnectedAt?: Date;
    private location?: Point;
    private angle?: number;
    private altitude?: number;
    private speed?: number;


    private constructor() {
        super();
    }

    //#region Factory Methods

    /**
     * Maps a DTO to a Tracker domain entity.
     * @param dto - Data transfer object.
     * @returns A Tracker instance.
     */
    public static mapToDomain(dto: TrackerDomainDto): Tracker {
        const tracker = new Tracker();

        tracker.setId(dto.id);
        tracker.setType(dto.type);
        tracker.setBusinessId(dto.businessId);
        tracker.setVehicleId(dto.vehicleId);
        tracker.setLastTrackedAt(dto.lastTrackedAt);
        tracker.setLastConnectedAt(dto.lastConnectedAt);
        tracker.setLocation(dto.location);
        tracker.setAngle(dto.angle);
        tracker.setAltitude(dto.altitude);
        tracker.setSpeed(dto.speed);

        return tracker;
    }

    /**
     * Updates the location of a Tracker.
     * @param dto - Data transfer object for updating location.
     * @returns A Tracker instance.
     */
    public static updateLocation(dto: TrackerUpdateLocationDomainDto): Tracker {
        const tracker = new Tracker();

        tracker.setLastTrackedAt(dto.lastTrackedAt);
        tracker.setLastConnectedAt(dto.lastConnectedAt);

        // Convert latitude and longitude to a Point object
        if (dto.latitude && dto.longitude) {
            tracker.setLocation(GeoUtils.latLngToPoint(dto.latitude, dto.longitude));
        }

        tracker.setAngle(dto.angle);
        tracker.setAltitude(dto.altitude);
        tracker.setSpeed(dto.speed);

        return tracker;
    }

    /**
     * Updates the last connected at date of a Tracker.
     * @param id - The ID of the Tracker.
     * @param lastConnectedAt - The last connected at date.
     * @returns A Tracker instance.
     */
    public static updateLastConnectedAt(id: number, lastConnectedAt: Date): Tracker {
        const tracker = new Tracker();

        tracker.setId(id);
        tracker.setLastConnectedAt(lastConnectedAt);

        return tracker;
    }

    /**
     * Creates a new Tracker instance.
     * @param dto - Data transfer object for creating a Tracker.
     * @returns A Tracker instance.
     */
    public static create(dto: TrackerCreateDomainDto): Tracker {
        const tracker = new Tracker();

        tracker.setType(dto.type);
        tracker.setBusinessId(dto.businessId);
        tracker.setVehicleId(dto.vehicleId);

        return tracker;
    }

    //#endregion

    //#region Setters

    public setType(value: TrackerType): void {
        this.type = value;
    }

    public setBusinessId(value: number): void {
        this.businessId = value;
    }

    public setVehicleId(value?: number): void {
        this.vehicleId = value;
    }

    public setLastTrackedAt(value?: Date): void {
        this.lastTrackedAt = value;
    }

    public setLastConnectedAt(value?: Date): void {
        this.lastConnectedAt = value;
    }

    public setLocation(value?: Point): void {
        this.location = value;
    }

    public setAngle(value?: number): void {
        this.angle = value;
    }

    public setAltitude(value?: number): void {
        this.altitude = value;
    }

    public setSpeed(value?: number): void {
        this.speed = value;
    }

    //#endregion

    //#region Getters

    public getType(): TrackerType {
        return this.type;
    }

    public getBusinessId(): number {
        return this.businessId;
    }

    public getVehicleId(): number | undefined {
        return this.vehicleId;
    }

    public getLastTrackedAt(): Date | undefined {
        return this.lastTrackedAt;
    }

    public getLastConnectedAt(): Date | undefined {
        return this.lastConnectedAt;
    }

    public getLocation(): Point | undefined {
        return this.location;
    }

    public getAngle(): number | undefined {
        return this.angle;
    }

    public getAltitude(): number | undefined {
        return this.altitude;
    }

    public getSpeed(): number | undefined {
        return this.speed;
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