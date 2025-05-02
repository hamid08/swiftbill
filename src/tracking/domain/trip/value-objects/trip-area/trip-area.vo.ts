import { TripAreaType } from "src/tracking";
import { ValueObject, AppException } from "src/common";
import { Geometry, LineString, Point, Polygon } from "typeorm";

export class TripArea extends ValueObject {
    private caption: string;
    private type: TripAreaType;
    private geoContent: Geometry;
    private tripId: number;

    private constructor() {
        super();
    }

    //#region Factory Methods

    public static create(tripId: number, caption: string, type: TripAreaType, geoJson: string): TripArea {

        const tripArea = new TripArea();
        tripArea.setTripId(tripId);
        tripArea.setCaption(caption);
        tripArea.setType(type);
        tripArea.setGeoContent(this.parseGeoJson(geoJson));
        return tripArea;
    }

    public static mapToDomain(id: number, tripId: number, caption: string, type: TripAreaType, geoContent: Geometry): TripArea {
        const tripArea = new TripArea();
        tripArea.setId(id);
        tripArea.setTripId(tripId);
        tripArea.setCaption(caption);
        tripArea.setType(type);
        tripArea.setGeoContent(geoContent);
        return tripArea;
    }


    //#endregion

    //#region GeoJSON Parsing

    /**
     * Parses GeoJSON string into TypeORM Geometry object
     */
    private static parseGeoJson(geoJsonString: string): Geometry {
        try {
            const geoJson = JSON.parse(geoJsonString);

            if (!geoJson || !geoJson.type || !geoJson.coordinates) {
                throw AppException.BadRequest('Invalid GeoJSON: Missing required fields');
            }

            switch (geoJson.type) {
                case 'Polygon':
                    return this.validatePolygon(geoJson);
                case 'LineString':
                    return this.validateLineString(geoJson);
                case 'Point':
                    return this.validatePoint(geoJson);
                default:
                    throw AppException.BadRequest(`Unsupported GeoJSON type: ${geoJson.type}`);
            }
        } catch (e) {
            if (e instanceof AppException) throw e;
            throw AppException.BadRequest(`Failed to parse GeoJSON: ${e.message}`);
        }
    }

    private static validatePolygon(geoJson: any): Polygon {
        if (!Array.isArray(geoJson.coordinates)) {
            throw AppException.BadRequest('Polygon coordinates must be an array');
        }

        geoJson.coordinates.forEach((ring: any) => {
            if (ring.length < 4) {
                throw AppException.BadRequest('Polygon ring must have at least 4 coordinates');
            }

            // Check if first and last coordinates match (closed ring)
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
                throw AppException.BadRequest('Polygon ring must be closed (first and last coordinates must match)');
            }
        });

        return {
            type: 'Polygon',
            coordinates: geoJson.coordinates
        };
    }

    private static validateLineString(geoJson: any): LineString {
        if (!Array.isArray(geoJson.coordinates) || geoJson.coordinates.length < 2) {
            throw AppException.BadRequest('LineString must have at least 2 coordinates');
        }

        return {
            type: 'LineString',
            coordinates: geoJson.coordinates
        };
    }

    private static validatePoint(geoJson: any): Point {
        if (!Array.isArray(geoJson.coordinates) || geoJson.coordinates.length !== 2) {
            throw AppException.BadRequest('Point must have exactly 2 coordinates');
        }

        return {
            type: 'Point',
            coordinates: geoJson.coordinates
        };
    }

    /**
     * Converts the geometry back to GeoJSON string
     */
    public toGeoJson(): string {
        return JSON.stringify(this.geoContent);
    }

    //#endregion


    //#region Setters

    private setCaption(caption: string): void {
        this.caption = caption.trim();
    }

    private setType(type: TripAreaType): void {
        this.type = type;
    }

    private setGeoContent(geoContent: Geometry): void {
        this.geoContent = geoContent;
    }

    private setTripId(tripId: number): void {
        this.tripId = tripId;
    }

    //#endregion

    //#region Getters

    public getCaption(): string {
        return this.caption;
    }

    public getType(): TripAreaType {
        return this.type;
    }

    public getGeoContent(): Geometry {
        return this.geoContent;
    }

    public getTripId(): number {
        return this.tripId;
    }

    //#endregion
}