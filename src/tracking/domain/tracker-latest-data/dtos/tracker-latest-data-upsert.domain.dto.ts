import { Point } from "typeorm";

export class TrackerLatestDataUpsertDomainDto {
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
    latitude: number;
    longitude: number;
    angle: number;
    altitude: number;
    speed: number;
    trackerAssignmentId: number;
    extensionId?: number;
}

