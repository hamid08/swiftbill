import { ICommand } from "@nestjs/cqrs";
import { AppException } from "src/common";
import { TrackerAssignmentError, TrackerAssignmentMobileDto, TrackerAssignmentMobileVehicleSyncDto } from "src/tracking";

export class TrackerAssignmentMobileCommand implements ICommand {
    constructor(
        public readonly businessExternalId: string,
        public readonly dto?: TrackerAssignmentMobileDto,
        public readonly vehicleSyncDto?: TrackerAssignmentMobileVehicleSyncDto,
        public readonly isVehicleSync: boolean = false
    ) {
        if (!isVehicleSync && this.dto?.vehicleIds.length === 0) {
            throw AppException.BadRequest(TrackerAssignmentError.NoVehiclesSelected);
        }
        if (isVehicleSync && this.vehicleSyncDto?.externalIds.length === 0) {
            throw AppException.BadRequest(TrackerAssignmentError.NoVehiclesSelected);
        }
    }
}