import { TripCreationService } from "../trip.enum";

export class CurrentTripInfoDto {
    tripNumber: string;
    tripName: string;
    duration: number;
    violationCount: number;
    driverName: string;
    tripType: TripCreationService;
    startTrip: Date;
    endTrip?: Date;
}