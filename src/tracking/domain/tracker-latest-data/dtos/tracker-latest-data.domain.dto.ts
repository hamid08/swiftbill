import { Point } from "typeorm";

export class TrackerLatestDataDomainDto {
    id: number;
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
    location?: Point;
    angle: number;
    altitude: number;
    speed: number;
    trackerAssignmentId: number;
    extensionId?: number;
}

