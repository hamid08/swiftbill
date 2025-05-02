import { TripCreationService } from "../trip.enum";

export class TripGridResponseDto {
    id: number;
    tripNumber: string;
    tripName: string;
    duration: number;
    driverName: string;
    tripType: TripCreationService;
    startTrip: Date;
    endTrip?: Date;
    violationCount: number;
}
