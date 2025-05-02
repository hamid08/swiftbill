import { Entity } from "src/common";
import { TripArea } from "./value-objects";
import { TripCreationService } from "./trip.enum";
import { LineString } from "typeorm";
import { Tracker } from "../tracker";
import { TripCreateDomainDto, TripDomainDto } from "./dtos";

export class Trip extends Entity {
    private caption: string;
    private maxGeofenceBreaches: number;
    private creationService: TripCreationService;
    private startDate: Date;
    private path: LineString;
    private trackerId: number;
    private tracker: Tracker;
    private endDate?: Date;
    private tripNumber?: string;
    private driverName?: string;
    private duration?: number;
    private areas?: TripArea[];

    private constructor() {
        super();
    }

    //#region Factory Methods

    /**
     * Maps a DTO to a Trip domain entity.
     * @param dto - Data transfer object.
     * @returns A Trip instance.
     */
    public static mapToDomain(dto: TripDomainDto): Trip {
        const trip = new Trip();
        trip.setCaption(dto.caption);
        trip.setMaxGeofenceBreaches(dto.maxGeofenceBreaches);
        trip.setCreationService(dto.creationService);
        trip.setStartDate(dto.startDate);
        trip.setPath(dto.path);
        trip.setTrackerId(dto.trackerId);
        trip.setEndDate(dto.endDate);
        trip.setTripNumber(dto.tripNumber);
        trip.setDriverName(dto.driverName);
        trip.setDuration(dto.duration);
        trip.setAreas(dto.areas);
        return trip;
    }

    /**
     * Creates a new Trip instance from a DTO.
     * @param dto - Data transfer object.
     * @returns A Trip instance.
     */
    public static create(dto: TripCreateDomainDto): Trip {
        const trip = new Trip();
        trip.setCaption(dto.caption);
        trip.setMaxGeofenceBreaches(dto.maxGeofenceBreaches);
        trip.setCreationService(dto.creationService);
        trip.setStartDate(dto.startDate);
        trip.setPath(this.geoJsonToLineString(dto.path));
        trip.setTrackerId(dto.trackerId);
        trip.setTripNumber(dto.tripNumber);
        trip.setDriverName(dto.driverName);
        trip.setDuration(dto.duration);
        return trip;
    }

    //#endregion

    //#region Private Methods

    /**
     * Converts a GeoJSON string to a LineString object.
     * @param geoJsonString - The GeoJSON string representation of a LineString.
     * @returns A LineString object.
     * @throws Error if the input is invalid.
     */
    public static geoJsonToLineString(geoJsonString: string): LineString {
        try {
            const geoJson = JSON.parse(geoJsonString);

            if (!geoJson || geoJson.type !== 'LineString' || !Array.isArray(geoJson.coordinates)) {
                throw new Error('Invalid GeoJSON - must be LineString type');
            }

            // Validate coordinates
            if (geoJson.coordinates.length === 0) {
                throw new Error('LineString must have at least one coordinate pair');
            }

            geoJson.coordinates.forEach(coord => {
                if (!Array.isArray(coord) || coord.length !== 2 ||
                    typeof coord[0] !== 'number' || typeof coord[1] !== 'number') {
                    throw new Error('Invalid coordinate format in LineString');
                }
            });

            // Remove duplicate coordinates
            const uniqueCoordinates = this.removeDuplicateCoordinates(geoJson.coordinates);

            return {
                type: 'LineString',
                coordinates: uniqueCoordinates
            };
        } catch (e) {
            throw new Error(`Failed to parse GeoJSON: ${e.message}`);
        }
    }

    /**
     * Removes consecutive duplicate coordinates from an array of coordinates
     * @param coordinates - Array of coordinate pairs
     * @returns Array of coordinate pairs with consecutive duplicates removed
     */
    private static removeDuplicateCoordinates(coordinates: number[][]): number[][] {
        return coordinates.filter((coord, index, arr) => {
            // Keep the coordinate if it's the first one or different from the previous one
            return index === 0 || 
                   !(coord[0] === arr[index - 1][0] && coord[1] === arr[index - 1][1]);
        });
    }

    //#endregion

    //#region Setters

    public setCaption(caption: string): void {
        this.caption = caption;
    }

    public setMaxGeofenceBreaches(maxGeofenceBreaches: number): void {
        this.maxGeofenceBreaches = maxGeofenceBreaches;
    }

    public setCreationService(creationService: TripCreationService): void {
        this.creationService = creationService;
    }

    public setStartDate(startDate: Date): void {
        this.startDate = startDate;
    }

    public setPath(path: LineString): void {
        this.path = path;
    }

    public setTrackerId(trackerId: number): void {
        this.trackerId = trackerId;
    }

    public setTracker(tracker: Tracker): void {
        this.tracker = tracker;
    }

    public setEndDate(endDate: Date | undefined): void {
        this.endDate = endDate;
    }

    public setTripNumber(tripNumber: string | undefined): void {
        this.tripNumber = tripNumber;
    }

    public setDriverName(driverName: string | undefined): void {
        this.driverName = driverName;
    }

    public setDuration(duration: number | undefined): void {
        this.duration = duration;
    }

    public setAreas(areas: TripArea[] | undefined): void {
        this.areas = areas;
    }

    //#endregion

    //#region Getters

    public getCaption(): string {
        return this.caption;
    }

    public getMaxGeofenceBreaches(): number {
        return this.maxGeofenceBreaches;
    }

    public getCreationService(): TripCreationService {
        return this.creationService;
    }

    public getStartDate(): Date {
        return this.startDate;
    }

    public getPath(): LineString {
        return this.path;
    }

    public getTrackerId(): number {
        return this.trackerId;
    }

    public getTracker(): Tracker {
        return this.tracker;
    }

    public getEndDate(): Date | undefined {
        return this.endDate;
    }

    public getTripNumber(): string | undefined {
        return this.tripNumber;
    }

    public getDriverName(): string | undefined {
        return this.driverName;
    }

    public getDuration(): number | undefined {
        return this.duration;
    }

    public getAreas(): TripArea[] | undefined {
        return this.areas;
    }

    //#endregion
}