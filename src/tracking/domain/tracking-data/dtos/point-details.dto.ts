import { MinimalLocationB1, PlaqueType } from "src/tracking";

import { PlaqueStatus } from "../../enums";

export class PointDetailsDto {
    location: MinimalLocationB1 | null;
    vehicle?: PointDetailVehicleDto;
    currentTrip?: PointDetailTripDto;
}

export class PointDetailVehicleDto {
    plaqueNo?: string;
    plaqueType?: PlaqueType;
    plaqueStatus: PlaqueStatus;
}

export class PointDetailTripDto {
    tripNo: string;
    destinationAddress: string;
    passengerFullName: string;
    driverFullName: string;
    driverPhoneNumber: string;
}

