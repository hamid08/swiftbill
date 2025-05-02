import { Entity } from "src/common";
import { TrackingDevice } from "../tracking-device";
import { Tracker } from "../tracker/tracker.entity";
import { TrackerAssignmentCreateDomainDto, TrackerAssignmentDomainDto } from "./dtos";

export class TrackerAssignment extends Entity {
    private terminalNumber: string;
    private isDefault: boolean;
    private startDate: Date;
    private endDate?: Date;
    private trackingDeviceId: number;
    private trackerId: number;

    // Relationships (optional, for domain logic)
    private trackingDevice?: TrackingDevice;
    private tracker?: Tracker;

    private constructor() {
        super();
    }

    //#region Primary Operations

    public static updateAssignment(id: number, trackingDeviceId: number, isDefault: boolean): TrackerAssignment {
        const trackerAssignment = new TrackerAssignment();
        trackerAssignment.setId(id);
        trackerAssignment.setIsDefault(isDefault);
        trackerAssignment.setTrackingDeviceId(trackingDeviceId);
        return trackerAssignment;
    }

    public static endAssignment(id: number): TrackerAssignment {
        const trackerAssignment = new TrackerAssignment();
        trackerAssignment.setId(id);
        trackerAssignment.setEndDate(new Date());
        trackerAssignment.setIsDefault(false);
        return trackerAssignment;
    }

    public static changeToDefaultAssignment(id: number): TrackerAssignment {
        const trackerAssignment = new TrackerAssignment();
        trackerAssignment.setId(id);
        trackerAssignment.setIsDefault(true);
        return trackerAssignment;
    }

    /**
     * Maps a DTO to a TrackerAssignment domain entity.
     * @param dto - The DTO to map.
     * @returns The mapped TrackerAssignment domain entity.
     */
    public static mapToDomain(dto: TrackerAssignmentDomainDto): TrackerAssignment {
        const trackerAssignment = new TrackerAssignment();

        trackerAssignment.setId(dto.id);
        trackerAssignment.setTerminalNumber(dto.terminalNumber);
        trackerAssignment.setIsDefault(dto.isDefault);
        trackerAssignment.setStartDate(dto.startDate);
        trackerAssignment.setEndDate(dto.endDate);
        trackerAssignment.setTrackingDeviceId(dto.trackingDeviceId);
        trackerAssignment.setTrackerId(dto.trackerId);

        return trackerAssignment;
    }

    /**
     * Creates a new TrackerAssignment domain entity from a DTO.
     * @param dto - The DTO to create the entity from.
     * @returns The created TrackerAssignment domain entity.
     */
    public static create(dto: TrackerAssignmentCreateDomainDto): TrackerAssignment {
        const trackerAssignment = new TrackerAssignment();

        trackerAssignment.setTerminalNumber(dto.terminalNumber);
        trackerAssignment.setIsDefault(dto.isDefault);
        trackerAssignment.setStartDate(new Date());
        trackerAssignment.setTrackingDeviceId(dto.trackingDeviceId);
        trackerAssignment.setTrackerId(dto.trackerId);

        return trackerAssignment;
    }

    //#endregion

    //#region Setters

    public setTerminalNumber(value: string): void {
        this.terminalNumber = value;
    }

    public setIsDefault(value: boolean): void {
        this.isDefault = value;
    }

    public setStartDate(value: Date): void {
        this.startDate = value;
    }

    public setEndDate(value: Date | undefined): void {
        this.endDate = value;
    }

    public setTrackingDeviceId(value: number): void {
        this.trackingDeviceId = value;
    }

    public setTrackerId(value: number): void {
        this.trackerId = value;
    }

    // Optional setters for relationships
    public setTrackingDevice(value: TrackingDevice): void {
        this.trackingDevice = value;
    }

    public setTracker(value: Tracker): void {
        this.tracker = value;
    }

    //#endregion

    //#region Getters

    public getTerminalNumber(): string {
        return this.terminalNumber;
    }

    public getIsDefault(): boolean {
        return this.isDefault;
    }

    public getStartDate(): Date {
        return this.startDate;
    }

    public getEndDate(): Date | undefined {
        return this.endDate;
    }

    public getTrackingDeviceId(): number {
        return this.trackingDeviceId;
    }

    public getTrackerId(): number {
        return this.trackerId;
    }

    // Optional getters for relationships
    public getTrackingDevice(): TrackingDevice | undefined {
        return this.trackingDevice;
    }

    public getTracker(): Tracker | undefined {
        return this.tracker;
    }

    //#endregion
}