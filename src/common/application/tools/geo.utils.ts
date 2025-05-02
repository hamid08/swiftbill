import { Point, LineString } from 'typeorm';

/**
 * Utility class for geographic coordinate conversions.
 */
export class GeoUtils {

    /**
     * Creates a point with explicit SRID for PostGIS
    */
    public static createPostGISPoint(lat: number, lng: number): string {
        return `SRID=4326;POINT(${lng} ${lat})`;
    }


    /**
     * Converts latitude and longitude to a Point object.
     * @param latitude - The latitude value.
     * @param longitude - The longitude value.
     * @returns A Point object.
     */
    public static latLngToPoint(latitude: number, longitude: number): Point {
        return {
            type: 'Point',
            coordinates: [longitude, latitude], // GeoJSON uses [longitude, latitude]
        };
    }

    /**
     * Converts a Point object to latitude and longitude.
     * @param point - The Point object.
     * @returns An object containing latitude and longitude.
     * @throws Error if the Point is invalid.
     */
    public static pointToLatLng(point: Point): { latitude: number; longitude: number } {
        if (!point || point.type !== 'Point' || !point.coordinates || point.coordinates.length !== 2) {
            throw new Error('Invalid Point object');
        }

        const [longitude, latitude] = point.coordinates;
        return { latitude, longitude };
    }

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

            return {
                type: 'LineString',
                coordinates: geoJson.coordinates
            };
        } catch (e) {
            throw new Error(`Failed to parse GeoJSON: ${e.message}`);
        }
    }

    /**
     * Converts a LineString object to a GeoJSON string.
     * @param lineString - The LineString object.
     * @returns A GeoJSON string representation.
     * @throws Error if the LineString is invalid.
     */
    public static lineStringToGeoJson(lineString: LineString): string {
        if (!lineString || lineString.type !== 'LineString' || !Array.isArray(lineString.coordinates)) {
            throw new Error('Invalid LineString object');
        }

        return JSON.stringify({
            type: 'LineString',
            coordinates: lineString.coordinates
        });
    }
}