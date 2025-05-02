import { Point } from "typeorm";

export class TrackerLatestDataUpsertWithTerminalNumberDomainDto {
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
    latitude: number;
    longitude: number;
    angle: number;
    altitude: number;
    speed: number;
    extensionId?: number;
}

