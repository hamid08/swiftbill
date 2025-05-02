import { Geometry } from "typeorm";
import { TripAreaType } from "../value-objects";

export class TripRouteResponseDto {
    caption: string;
    maximumGeofenceBreach: number;
    coordinates: number[][];
    allowedAreas?: TripAreaRouteResponseDto[];
}

export class TripAreaRouteResponseDto {
    caption: string;
    type: TripAreaType;
    geoContent: Geometry;
}

