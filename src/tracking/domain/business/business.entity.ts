import { Entity } from "src/common";
import { Tracker } from "../tracker";
import { TrackingDevice } from "../tracking-device";
import { BusinessDomainDto } from "./dtos";
import { Vehicle } from "../vehicle";

export class Business extends Entity {

  private externalId: string;
  private displayName: string;
  private icon?: string;
  private vehicles: Vehicle[];
  private trackingDevices: TrackingDevice[] = [];
  private trackers: Tracker[] = [];

  private constructor() {
    super();
  }

  // Static Factory Method
  public static create(externalId: string, displayName: string, icon?: string): Business {
    const business = new Business();
    business.setExternalId(externalId);
    business.setDisplayName(displayName);
    business.setIcon(icon);
    return business;
  }

  public static mapToDomain(dto: BusinessDomainDto): Business {
    const business = new Business();

    business.setId(dto.id);
    business.setExternalId(dto.externalId);
    business.setDisplayName(dto.displayName);
    business.setIcon(dto.icon);

    return business;
  }


  // Getters
  public getId(): number {
    return this.id;
  }

  public getExternalId(): string {
    return this.externalId;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getIcon(): string | undefined {
    return this.icon;
  }

  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public getTrackingDevices(): TrackingDevice[] {
    return this.trackingDevices;
  }

  public getTrackers(): Tracker[] {
    return this.trackers;
  }

  // Setters
  public setExternalId(externalId: string): void {
    this.externalId = externalId;
  }

  public setDisplayName(displayName: string): void {
    this.displayName = displayName;
  }

  public setIcon(icon: string | undefined): void {
    this.icon = icon;
  }

  public setVehicles(vehicles: Vehicle[]): void {
    this.vehicles = vehicles;
  }

  public setTrackingDevices(trackingDevices: TrackingDevice[]): void {
    this.trackingDevices = trackingDevices;
  }

  public setTrackers(trackers: Tracker[]): void {
    this.trackers = trackers;
  }
}