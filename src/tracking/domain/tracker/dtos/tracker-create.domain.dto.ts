import { TrackerType } from "../../enums";

export interface TrackerCreateDomainDto {
    type: TrackerType;
    businessId: number;
    vehicleId?: number;
}