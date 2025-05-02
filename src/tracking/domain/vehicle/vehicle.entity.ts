import { Entity } from "src/common";
import { Tracker } from "../tracker";
import { PlaqueStatus, PlaqueType } from "../enums";
import { Business } from "../business";
import { VehicleCreateDomainDto, VehicleDomainDto } from "./dtos";

export class Vehicle extends Entity {
    private externalId: string;
    private name?: string;
    private identity: string;
    private plaqueStatus: PlaqueStatus;
    private plaqueType?: PlaqueType;
    private plaqueNo?: string;
    private vehicleModelName?: string;
    private vehicleModelId?: string;
    private userTypeName?: string;
    private userTypeId?: string;
    private companyName?: string;
    private image?: string;
    private imei?: string;
    private businessId: number;
    private business: Business;
    private trackerId?: number;
    private tracker?: Tracker;

    private constructor() {
        super();
    }

    public static create(dto: VehicleCreateDomainDto): Vehicle {
        const vehicle = new Vehicle();
        vehicle.setExternalId(dto.externalId);
        vehicle.setName(dto.name);
        vehicle.setIdentity(dto.identity);
        vehicle.setPlaqueStatus(dto.plaqueStatus);
        vehicle.setPlaqueType(dto.plaqueType);
        vehicle.setPlaqueNo(dto.plaqueNo);
        vehicle.setVehicleModelName(dto.vehicleModelName);
        vehicle.setVehicleModelId(dto.vehicleModelId);
        vehicle.setUserTypeName(dto.userTypeName);
        vehicle.setUserTypeId(dto.userTypeId);
        vehicle.setCompanyName(dto.companyName);
        vehicle.setImage(dto.image);
        vehicle.setImei(dto.imei);
        vehicle.setBusinessId(dto.businessId);
        return vehicle;
    }

    public static mapToDomain(dto: VehicleDomainDto): Vehicle {
        const vehicle = new Vehicle();
        vehicle.setId(dto.id); 
        vehicle.setExternalId(dto.externalId);
        vehicle.setName(dto.name);
        vehicle.setIdentity(dto.identity);
        vehicle.setPlaqueStatus(dto.plaqueStatus);
        vehicle.setPlaqueType(dto.plaqueType);
        vehicle.setPlaqueNo(dto.plaqueNo);
        vehicle.setVehicleModelName(dto.vehicleModelName);
        vehicle.setVehicleModelId(dto.vehicleModelId);
        vehicle.setUserTypeName(dto.userTypeName);
        vehicle.setUserTypeId(dto.userTypeId);
        vehicle.setCompanyName(dto.companyName);
        vehicle.setImage(dto.image);
        vehicle.setImei(dto.imei);
        vehicle.setBusinessId(dto.businessId);
        vehicle.setTrackerId(dto.trackerId);
        return vehicle;
    }

    // Getters
    public getId(): number {
        return this.id;
    }

    public getExternalId(): string {
        return this.externalId;
    }

    public getName(): string | undefined {
        return this.name;
    }

    public getIdentity(): string {
        return this.identity;
    }

    public getPlaqueStatus(): PlaqueStatus {
        return this.plaqueStatus;
    }

    public getPlaqueType(): PlaqueType {
        return this.plaqueType;
    }

    public getPlaqueNo(): string | undefined {
        return this.plaqueNo;
    }

    public getVehicleModelName(): string | undefined {
        return this.vehicleModelName;
    }

    public getVehicleModelId(): string | undefined {
        return this.vehicleModelId;
    }

    public getUserTypeName(): string | undefined {
        return this.userTypeName;
    }

    public getUserTypeId(): string | undefined {
        return this.userTypeId;
    }

    public getCompanyName(): string | undefined {
        return this.companyName;
    }

    public getImage(): string | undefined {
        return this.image;
    }

    public getImei(): string | undefined {
        return this.imei;
    }

    public getBusinessId(): number {
        return this.businessId;
    }

    public getBusiness(): Business {
        return this.business;
    }

    public getTrackerId(): number | undefined {
        return this.trackerId;
    }

    public getTracker(): Tracker | undefined {
        return this.tracker;
    }

    // Setters
    public setExternalId(externalId: string): void {
        this.externalId = externalId;
    }

    public setName(name: string | undefined): void {
        this.name = name;
    }

    public setIdentity(identity: string): void {
        this.identity = identity;
    }

    public setPlaqueStatus(plaqueStatus: PlaqueStatus): void {
        this.plaqueStatus = plaqueStatus;
    }

    public setPlaqueType(plaqueType: PlaqueType): void {
        this.plaqueType = plaqueType;
    }

    public setPlaqueNo(plaqueNo: string | undefined): void {
        this.plaqueNo = plaqueNo;
    }

    public setVehicleModelName(vehicleModelName: string | undefined): void {
        this.vehicleModelName = vehicleModelName;
    }

    public setVehicleModelId(vehicleModelId: string | undefined): void {
        this.vehicleModelId = vehicleModelId;
    }

    public setUserTypeName(userTypeName: string | undefined): void {
        this.userTypeName = userTypeName;
    }

    public setUserTypeId(userTypeId: string | undefined): void {
        this.userTypeId = userTypeId;
    }

    public setCompanyName(companyName: string | undefined): void {
        this.companyName = companyName;
    }

    public setImage(image: string | undefined): void {
        this.image = image;
    }

    public setImei(imei: string | undefined): void {
        this.imei = imei;
    }

    public setBusinessId(businessId: number): void {
        this.businessId = businessId;
    }

    public setBusiness(business: Business): void {
        this.business = business;
    }

    public setTrackerId(trackerId: number | undefined): void {
        this.trackerId = trackerId;
    }

    public setTracker(tracker: Tracker | undefined): void {
        this.tracker = tracker;
    }
}