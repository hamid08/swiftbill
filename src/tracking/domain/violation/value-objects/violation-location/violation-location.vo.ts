import { GeoUtils, ValueObject } from "src/common";
import { AppException } from "src/common";
import { Point } from "typeorm";
import { ViolationLocationType } from "./violation-location.enum";

export class ViolationLocation extends ValueObject {
    private location: Point;
    private angle?: number;
    private altitude?: number;
    private speed?: number;
    private occurredAt: Date;
    private locationType: ViolationLocationType;
    private violationId: number;

    private constructor() {
        super();
    }

    public static create(
        occurredAt: Date,
        locationType: ViolationLocationType,
        violationId: number,
        latitude?: number,
        longitude?: number,
        angle?: number,
        altitude?: number,
        speed?: number
    ): ViolationLocation {
        // Validate required fields
        if (!occurredAt || !locationType || !violationId) {
            throw AppException.BadRequest("Required fields are missing for ViolationLocation creation.");
        }
        

        let violationLocation = new ViolationLocation();
        // Convert latitude and longitude to a Point object
        if (latitude && longitude) {
            violationLocation.setLocation(GeoUtils.latLngToPoint(latitude, longitude));
        }

        violationLocation.setAngle(angle);
        violationLocation.setAltitude(altitude);
        violationLocation.setSpeed(speed);
        violationLocation.setOccurredAt(occurredAt);
        violationLocation.setLocationType(locationType);
        violationLocation.setViolationId(violationId);
        return violationLocation;
    }

    //#region Getters

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

    public getOccurredAt(): Date {
        return this.occurredAt;
    }

    public getLocationType(): ViolationLocationType {
        return this.locationType;
    }

    public getViolationId(): number {
        return this.violationId;
    }

    //#endregion

    //#region Setters

    public setLocation(location: Point | undefined): void {
        this.location = location;
    }

    public setAngle(angle: number | undefined): void {
        this.angle = angle;
    }

    public setAltitude(altitude: number | undefined): void {
        this.altitude = altitude;
    }

    public setSpeed(speed: number | undefined): void {
        this.speed = speed;
    }

    public setOccurredAt(occurredAt: Date): void {
        this.occurredAt = occurredAt;
    }

    public setLocationType(locationType: ViolationLocationType): void {
        this.locationType = locationType;
    }

    public setViolationId(violationId: number): void {
        this.violationId = violationId;
    }

    //#endregion
}