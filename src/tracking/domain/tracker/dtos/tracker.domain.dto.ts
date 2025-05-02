import { TrackerType } from "../../enums";
import { Point } from "typeorm";

export interface TrackerDomainDto {
    id: number;
    type: TrackerType;
    businessId: number;
    vehicleId?: number;
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
    location?: Point;
    angle?: number;
    altitude?: number;
    speed?: number;

}