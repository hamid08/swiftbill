import { IQuery } from "@nestjs/cqrs";
import { AppException } from "src/common";

export class GetVehicleTrackingInfoQuery implements IQuery {
    constructor(public readonly vehicleIds: string[]) {

        if (this.vehicleIds == null || this.vehicleIds.length == 0) {
            throw AppException.BadRequest('Invalid vehicle ids');
        }
    }
}

