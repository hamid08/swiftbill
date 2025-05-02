import { AppException, Entity } from "src/common";
import { IoElement } from "../value-objects";
import { TrackingDataCreateDomainDto, TrackingDataDomainDto } from "./dtos";
import { LocationType, TrackingDataCheckStage } from "./tracking-data.enum";

export class TrackingData extends Entity<string> {
  private imei: string;
  private terminalNumber: string;
  private extensionId?: string;
  private trafficDate: Date;
  private altitude?: number;
  private angle?: number;
  private latitude?: number;
  private longitude?: number;
  private speed?: number;
  private ioElements?: IoElement[];
  private locationType: LocationType;
  private trackingDataCheckStage: TrackingDataCheckStage;

  private constructor() {
    super();
  }

  //#region  Tools
  private validateCoordinates(latitude: number | null | undefined, longitude: number | null | undefined): LocationType {
    if (latitude == null || longitude == null || isNaN(latitude) || isNaN(longitude)) return LocationType.NoLocation;

    // Round off to a reasonable precision (e.g., 6 decimal places for lat/long)
    latitude = Math.round((latitude + Number.EPSILON) * 1e6) / 1e6;
    longitude = Math.round((longitude + Number.EPSILON) * 1e6) / 1e6;

    if (latitude === 0 && longitude === 0) return LocationType.Invalid;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return LocationType.Invalid;

    return LocationType.Valid;
  }

  //#endregion

  //#region Primary Operation

  public static mapToDomain(dto: TrackingDataDomainDto): TrackingData {
    const trackingData = new TrackingData();

    trackingData.setId(dto.id);
    trackingData.setImei(dto.imei);
    trackingData.setTerminalNumber(dto.terminalNumber);
    trackingData.setExtensionId(dto.extensionId);
    trackingData.setTrafficDate(dto.trafficDate);
    trackingData.setAltitude(dto.altitude);
    trackingData.setAngle(dto.angle);
    trackingData.setLatitude(dto.latitude);
    trackingData.setLongitude(dto.longitude);
    trackingData.setSpeed(dto.speed);
    trackingData.setIoElements(dto.ioElements);

    // Default LocationType to 'Valid' if not provided
    const locationType = dto.locationType || LocationType.Valid;
    trackingData.setLocationType(locationType);

    return trackingData;
  }


  public static create(dto: TrackingDataCreateDomainDto): TrackingData {
    const trackingData = new TrackingData();

    trackingData.setImei(dto.imei);
    trackingData.setTerminalNumber(dto.terminalNumber);
    trackingData.setExtensionId(dto.extensionId);
    trackingData.setTrafficDate(dto.trafficDate);
    trackingData.setAltitude(dto.altitude);
    trackingData.setAngle(dto.angle);
    trackingData.setLatitude(dto.latitude);
    trackingData.setLongitude(dto.longitude);
    trackingData.setSpeed(dto.speed);
    trackingData.setIoElements(dto.ioElements);

    trackingData.setTrackingDataCheckStage(TrackingDataCheckStage.LocationValidation);

    // Use validateCoordinates to set locationType
    const locationType = trackingData.validateCoordinates(dto.latitude, dto.longitude);
    trackingData.setLocationType(locationType);

    return trackingData;
  }

  //#endregion


  //#region Set Values

  public setImei(value: string): void {
    this.imei = value;
  }

  public setTerminalNumber(value: string): void {
    this.terminalNumber = value;
  }

  public setExtensionId(value: string): void {
    this.extensionId = value;
  }

  public setTrafficDate(value: Date): void {
    this.trafficDate = value;
  }

  public setAltitude(value: number | undefined): void {
    this.altitude = value;
  }

  public setAngle(value: number | undefined): void {
    this.angle = value;
  }

  public setLatitude(value: number | undefined): void {
    this.latitude = value;
  }

  public setLongitude(value: number | undefined): void {
    this.longitude = value;
  }

  public setSpeed(value: number | undefined): void {
    this.speed = value;
  }

  public setIoElements(value: IoElement[] | undefined): void {
    this.ioElements = value;
  }

  public setLocationType(value: LocationType): void {
    this.locationType = value;
  }

  public setTrackingDataCheckStage(value: TrackingDataCheckStage): void {
    this.trackingDataCheckStage = value;
  }

  //#endregion

  //#region Get Values

  public getImei(): string {
    return this.imei;
  }

  public getTerminalNumber(): string {
    return this.terminalNumber;
  }

  public getExtensionId(): string {
    return this.extensionId;
  }

  public getTrafficDate(): Date {
    return this.trafficDate;
  }

  public getAltitude(): number | undefined {
    return this.altitude;
  }

  public getAngle(): number | undefined {
    return this.angle;
  }

  public getLatitude(): number | undefined {
    return this.latitude;
  }

  public getLongitude(): number | undefined {
    return this.longitude;
  }

  public getSpeed(): number | undefined {
    return this.speed;
  }

  public getIoElements(): IoElement[] | undefined {
    return this.ioElements;
  }

  public getLocationType(): LocationType {
    return this.locationType;
  }

  public getTrackingDataCheckStage(): TrackingDataCheckStage {
    return this.trackingDataCheckStage;
  }

  //#endregion


}
