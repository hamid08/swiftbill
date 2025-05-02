import { ICommand } from "@nestjs/cqrs";
import { AppException } from "src/common";
import { UserError } from "src/tracking/domain";    

export class UserUnassignVehiclesCommand implements ICommand {
    constructor(
      public readonly userId: number,
      public readonly vehicleIds: number[],
    ) {
        if (!vehicleIds || vehicleIds.length === 0) {
            throw AppException.BadRequest(UserError.AtLeastOneVehicleId);
          }
          if (vehicleIds.some(id => isNaN(id))) {
            throw AppException.BadRequest(UserError.InvalidVehicleIds);
          }
    }
  }