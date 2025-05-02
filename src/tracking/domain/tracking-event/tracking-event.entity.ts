import { Entity, GeoUtils } from "src/common";
import { TrackingEventLevel } from "./tracking-event.enum";
import { Point } from "typeorm";
import { TrackingEventCreateDomainDto, TrackingEventDomainDto } from "./dtos";

export class TrackingEvent extends Entity {

    private location?: Point;
    private angle?: number;
    private altitude?: number;
    private speed?: number;
    private occurredAt: Date;
    private level: TrackingEventLevel;
    private isSeen: boolean;
    private trackerAssignmentId: number;
    private ioParameterId: number;
    private trackingExtensionId?: number;
    private ioParameterValue: string;

    private constructor() {
        super();
    }

    //#region Primary Operations

    public static mapToDomain(dto: TrackingEventDomainDto): TrackingEvent {
        const trackingEvent = new TrackingEvent();

        trackingEvent.setId(dto.id);
        trackingEvent.setLocation(dto.location);
        trackingEvent.setAngle(dto.angle);
        trackingEvent.setAltitude(dto.altitude);
        trackingEvent.setSpeed(dto.speed);
        trackingEvent.setOccurredAt(dto.occurredAt);
        trackingEvent.setLevel(dto.level);
        trackingEvent.setIsSeen(dto.isSeen);
        trackingEvent.setTrackerAssignmentId(dto.trackerAssignmentId);
        trackingEvent.setIoParameterId(dto.ioParameterId);
        trackingEvent.setTrackingExtensionId(dto.trackingExtensionId);
        trackingEvent.setIoParameterValue(dto.ioParameterValue);

        return trackingEvent;
    }

    public static create(dto: TrackingEventCreateDomainDto): TrackingEvent {
        const trackingEvent = new TrackingEvent();

        // Convert latitude and longitude to a Point object
        if (dto.latitude && dto.longitude) {
            trackingEvent.setLocation(GeoUtils.latLngToPoint(dto.latitude, dto.longitude));
        }

        trackingEvent.setAngle(dto.angle);
        trackingEvent.setAltitude(dto.altitude);
        trackingEvent.setSpeed(dto.speed);
        trackingEvent.setOccurredAt(dto.occurredAt);
        trackingEvent.setLevel(dto.level);
        trackingEvent.setIsSeen(false); // Default value
        trackingEvent.setTrackerAssignmentId(dto.trackerAssignmentId);
        trackingEvent.setIoParameterId(dto.ioParameterId);
        trackingEvent.setTrackingExtensionId(dto.trackingExtensionId);
        trackingEvent.setIoParameterValue(dto.ioParameterValue);

        return trackingEvent;
    }

    //#endregion

    //#region Setters

    public setLocation(value: Point | undefined): void {
        this.location = value;
    }

    public setAngle(value: number | undefined): void {
        this.angle = value;
    }

    public setAltitude(value: number | undefined): void {
        this.altitude = value;
    }

    public setSpeed(value: number | undefined): void {
        this.speed = value;
    }

    public setOccurredAt(value: Date): void {
        this.occurredAt = value;
    }

    public setLevel(value: TrackingEventLevel): void {
        this.level = value;
    }

    public setIsSeen(value: boolean): void {
        this.isSeen = value;
    }

    public setTrackerAssignmentId(value: number): void {
        this.trackerAssignmentId = value;
    }

    public setIoParameterId(value: number): void {
        this.ioParameterId = value;
    }

    public setTrackingExtensionId(value: number | undefined): void {
        this.trackingExtensionId = value;
    }

    public setIoParameterValue(value: string): void {
        this.ioParameterValue = value;
    }

    //#endregion

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

    public getLevel(): TrackingEventLevel {
        return this.level;
    }

    public getIsSeen(): boolean {
        return this.isSeen;
    }

    public getTrackerAssignmentId(): number {
        return this.trackerAssignmentId;
    }

    public getIoParameterId(): number {
        return this.ioParameterId;
    }

    public getTrackingExtensionId(): number | undefined {
        return this.trackingExtensionId;
    }

    public getIoParameterValue(): string {
        return this.ioParameterValue;
    }

    //#endregion
}