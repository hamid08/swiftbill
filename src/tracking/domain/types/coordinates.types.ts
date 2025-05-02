import { GeometryType } from "./geometry.types";

// Base interface for GeoJSON coordinates
export interface GeoJsonCoordinates {
    type: GeometryType;
    coordinates: Coordinates1D | Coordinates2D | Coordinates3D; // Union of possible coordinate types
}

// Point Coordinates
export interface PointCoordinates extends GeoJsonCoordinates {
    type: GeometryType.Point;
    coordinates: Coordinates1D; // [longitude, latitude]
}

// LineString Coordinates
export interface LineStringCoordinates extends GeoJsonCoordinates {
    type: GeometryType.LineString;
    coordinates: Coordinates2D; // Array of [longitude, latitude]
}

// Polygon Coordinates
export interface PolygonCoordinates extends GeoJsonCoordinates {
    type: GeometryType.Polygon;
    coordinates: Coordinates3D; // Array of arrays (linear rings in 3D space)
}

// Coordinate type definitions
export type Coordinates1D = [number, number]; // [longitude, latitude]
export type Coordinates2D = Coordinates1D[]; // Array of [longitude, latitude]
export type Coordinates3D = Coordinates2D[]; // Array of arrays (linear rings in 3D space)

// Union type for GeoJSON geometries
export type GeoJson = PointCoordinates | LineStringCoordinates | PolygonCoordinates;

// Utility function to validate GeoJSON coordinates
export function validateGeoJsonCoordinates(geoJson: GeoJson): boolean {
    const isCoordinates1D = (coords: any): coords is Coordinates1D =>
        Array.isArray(coords) && coords.length === 2 && coords.every(Number.isFinite);

    const isCoordinates2D = (coords: any): coords is Coordinates2D =>
        Array.isArray(coords) && coords.every(isCoordinates1D);

    const isCoordinates3D = (coords: any): coords is Coordinates3D =>
        Array.isArray(coords) && coords.every(isCoordinates2D);

    switch (geoJson.type) {
        case GeometryType.Point:
            return isCoordinates1D(geoJson.coordinates);
        case GeometryType.LineString:
            return isCoordinates2D(geoJson.coordinates);
        case GeometryType.Polygon:
            return isCoordinates3D(geoJson.coordinates);
        default:
            return false;
    }
}
