import { LocationType } from "../tracking-data";

export class MinimalLocationB2 {
    altitude: number;
    angle: number;
    speed: number;
    lat: number;
    lng: number;
    date?: Date;
    locationType: LocationType;
}

