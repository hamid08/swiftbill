import { Entity } from "src/common";
import { ActiveStatus } from "../enums";
import { TrackingDeviceCreateDomainDto, TrackingDeviceDomainDto } from "./dtos";
import { TrackingModel } from "../tracking-model";

export class TrackingDevice extends Entity {
    private imei: string;
    private serialNumber?: string;
    private simNumber?: string;
    private remotePassword?: string;
    private identity?: string;
    private activeStatus: ActiveStatus;
    private modelId: number;
    private model: TrackingModel;
    private businessId: number;

    private constructor() {
        super();
    }

    //#region Primary Operations

    public static mapToDomain(dto: TrackingDeviceDomainDto): TrackingDevice {
        const trackingDevice = new TrackingDevice();

        trackingDevice.setId(dto.id);
        trackingDevice.setImei(dto.imei);
        trackingDevice.setSerialNumber(dto.serialNumber);
        trackingDevice.setSimNumber(dto.simNumber);
        trackingDevice.setRemotePassword(dto.remotePassword);
        trackingDevice.setIdentity(dto.identity);
        trackingDevice.setModelId(dto.modelId);
        trackingDevice.setBusinessId(dto.businessId);
        trackingDevice.setActiveStatus(dto.activeStatus);

        return trackingDevice;
    }

    public static create(dto: TrackingDeviceCreateDomainDto): TrackingDevice {
        const trackingDevice = new TrackingDevice();

        trackingDevice.setImei(dto.imei);
        trackingDevice.setSerialNumber(dto.serialNumber);
        trackingDevice.setSimNumber(dto.simNumber);
        trackingDevice.setRemotePassword(dto.remotePassword);
        trackingDevice.setIdentity(dto.identity);
        trackingDevice.setModelId(dto.modelId);
        trackingDevice.setBusinessId(dto.businessId);
        trackingDevice.setActiveStatus(ActiveStatus.Active);

        return trackingDevice;
    }

    public static update(id: number, modelId: number, serialNumber: string, simNumber: string, remotePassword: string, identity: string): TrackingDevice {
        const trackingDevice = new TrackingDevice();

        trackingDevice.setId(id);
        trackingDevice.setSerialNumber(serialNumber);
        trackingDevice.setSimNumber(simNumber);
        trackingDevice.setRemotePassword(remotePassword);
        trackingDevice.setIdentity(identity);
        trackingDevice.setModelId(modelId);

        return trackingDevice;
    }

    //#endregion

    //#region Setters

    public setId(value: number): void {
        this.id = value;
    }

    public setImei(value: string): void {
        this.imei = value;
    }

    public setSerialNumber(value: string | undefined): void {
        this.serialNumber = value;
    }

    public setSimNumber(value: string | undefined): void {
        this.simNumber = value;
    }

    public setRemotePassword(value: string | undefined): void {
        this.remotePassword = value;
    }

    public setIdentity(value: string | undefined): void {
        this.identity = value;
    }

    public setModelId(value: number): void {
        this.modelId = value;
    }

    public setBusinessId(value: number): void {
        this.businessId = value;
    }

    public setActiveStatus(value: ActiveStatus): void {
        this.activeStatus = value;
    }

    public setModel(value: TrackingModel) {
        this.model = value;
    }

    //#endregion

    //#region Getters

    public getId(): number {
        return this.id;
    }

    public getImei(): string {
        return this.imei;
    }

    public getSerialNumber(): string | undefined {
        return this.serialNumber;
    }

    public getSimNumber(): string | undefined {
        return this.simNumber;
    }

    public getRemotePassword(): string | undefined {
        return this.remotePassword;
    }

    public getIdentity(): string | undefined {
        return this.identity;
    }

    public getModelId(): number {
        return this.modelId;
    }

    public getBusinessId(): number {
        return this.businessId;
    }

    public getActiveStatus(): ActiveStatus {
        return this.activeStatus;
    }

    public getTrackingModel(): TrackingModel {
        return this.model;
    }

    //#endregion
}