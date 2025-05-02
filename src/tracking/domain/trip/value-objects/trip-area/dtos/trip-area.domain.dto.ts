import { Geometry, LineString } from "typeorm";
import { TripAreaType } from "../trip-area.enum";

export interface TripAreaDomainDto {
    id: string;
    caption: string;
    type: TripAreaType;
    geoContent: Geometry;
    tripId: number;
}