import { Entity } from "src/common";
import { TrackingExtensionStatus } from "./tracking-extension.enum";
import { TrackingExtensionDomainDto, TrackingExtensionCreateDomainDto, TrackingExtensionUpdateDomainDto } from "./dtos";
import { TrackingDevice } from "../tracking-device";

export class TrackingExtension extends Entity {
    private extensionId: string; // extensionId is the id of the tracking extension
    private caption: string;
    private description: string;
    private status: TrackingExtensionStatus;
    private updatedAt: Date;
    private deviceId: number;
    private trackingDevice: TrackingDevice;

    private constructor() {
        super();
    }

    //#region Primary Operations

    /**
     * Creates a new TrackingExtension instance from a DTO.
     * @param deviceId - The device ID.
     * @param dto - Partial data transfer object.
     * @returns A new TrackingExtension instance.
     */
    public static create(deviceId: number, dto: TrackingExtensionCreateDomainDto): TrackingExtension {
        const trackingExtension = new TrackingExtension();
        trackingExtension.setExtensionId(dto.extensionId);
        trackingExtension.setCaption(dto.caption);
        trackingExtension.setDescription(dto.description || "");
        trackingExtension.setStatus(TrackingExtensionStatus.Activating);
        trackingExtension.setUpdatedAt(new Date());
        trackingExtension.setDeviceId(deviceId);
        return trackingExtension;
    }

    /**
     * Updates a tracking extension.
     * @param trackingExtensionId - The tracking extension ID.
     * @param dto - Partial data transfer object.
     * @returns A new TrackingExtension instance.
     */
    public static update(trackingExtensionId: number, dto: TrackingExtensionUpdateDomainDto): TrackingExtension {
        const trackingExtension = new TrackingExtension();
        trackingExtension.setId(trackingExtensionId);
        trackingExtension.setCaption(dto.caption);
        trackingExtension.setDescription(dto.description || "");
        trackingExtension.setUpdatedAt(new Date());
        return trackingExtension;
    }


    /**
     * Maps a DTO to a TrackingExtension domain entity.
     * @param dto - Data transfer object.
     * @returns A TrackingExtension instance.
     */
    public static mapToDomain(dto: TrackingExtensionDomainDto): TrackingExtension {
        const trackingExtension = new TrackingExtension();
        trackingExtension.setId(dto.id);
        trackingExtension.setExtensionId(dto.extensionId);
        trackingExtension.setCaption(dto.caption);
        trackingExtension.setDescription(dto.description || "");
        trackingExtension.setStatus(dto.status);
        trackingExtension.setUpdatedAt(dto.updatedAt);
        trackingExtension.setDeviceId(dto.deviceId);
        return trackingExtension;
    }


    public static changeStatus(trackingExtensionId: number, status: TrackingExtensionStatus): TrackingExtension {
        const trackingExtension = new TrackingExtension();
        trackingExtension.setId(trackingExtensionId);
        trackingExtension.setStatus(status);
        trackingExtension.setUpdatedAt(new Date());
        return trackingExtension;
    }

    //#endregion

    //#region Setters

    public setExtensionId(value: string): void {
        this.extensionId = value;
    }

    public setCaption(value: string): void {
        this.caption = value;
    }

    public setDescription(value: string): void {
        this.description = value;
    }

    public setStatus(value: TrackingExtensionStatus): void {
        this.status = value;
    }

    public setUpdatedAt(value: Date): void {
        this.updatedAt = value;
    }

    public setDeviceId(value: number): void {
        this.deviceId = value;
    }

    public setTrackingDevice(value: TrackingDevice): void {
        this.trackingDevice = value;
    }

    //#endregion

    //#region Getters

    public getExtensionId(): string {
        return this.extensionId;
    }

    public getCaption(): string {
        return this.caption;
    }

    public getDescription(): string {
        return this.description;
    }

    public getStatus(): TrackingExtensionStatus {
        return this.status;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public getDeviceId(): number {
        return this.deviceId;
    }

    public getTrackingDevice(): TrackingDevice {
        return this.trackingDevice;
    }

    //#endregion
}