import { TripCreationService } from "../trip.enum";

export interface TripCreateDomainDto {
    caption: string;
    maxGeofenceBreaches: number;
    creationService: TripCreationService;
    startDate: Date;
    path: string;
    trackerId: number;
    tripNumber?: string;
    driverName?: string;
    duration?: number;
}