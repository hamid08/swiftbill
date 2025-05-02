import { LocationType, TrackingPointType } from "../../tracking-data";

export class TripTrackedRouteResponseDto {
    id: string;
    altitude: number;
    lng: number;
    lat: number;
    angle: number;
    speed: number;
    type: TrackingPointType;
    trafficDate: Date;
    locationType: LocationType;
}