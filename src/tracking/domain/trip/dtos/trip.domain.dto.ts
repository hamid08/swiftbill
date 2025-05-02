import { LineString } from "typeorm";
import { TripCreationService } from "../trip.enum";
import { TripArea } from "../value-objects";

export interface TripDomainDto {
    id: number;
    caption: string;
    maxGeofenceBreaches: number;
    creationService: TripCreationService;
    startDate: Date;
    path: LineString;
    trackerId: number;
    endDate?: Date;
    tripNumber?: string;
    driverName?: string;
    duration?: number;
    areas?: TripArea[];
}