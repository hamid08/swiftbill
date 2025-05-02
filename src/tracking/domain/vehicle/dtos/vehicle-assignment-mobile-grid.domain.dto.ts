import { PlaqueStatus, PlaqueType } from "../../enums";

export class VehicleAssignmentMobileGridResponseDto {
    id: number;
    identity: string;
    plaqueStatus: PlaqueStatus;
    plaqueType: PlaqueType;
    plaqueNo: string;
    imei?: string;
}

