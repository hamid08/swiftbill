import { LocationType } from "../tracking-data";

export class MinimalLocationB3 {
    assignmentId: number;
    altitude: number;
    angle: number;
    speed: number;
    lat: number;
    lng: number;
    date?: Date;
    lastConnectedAt?: Date;
    lastTrackedAt?: Date;
}

