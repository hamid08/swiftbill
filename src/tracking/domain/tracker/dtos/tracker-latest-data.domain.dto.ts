import { Point } from "typeorm";

export class TrackerMinimalLatestDataResponseDto {
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
    location?: Point;
}

