import { ActiveStatus, PlaqueStatus, PlaqueType } from "../../enums";

export class TrackerAssignmentGridResponseDto {
    id: number;
    vehicleIdentityNo?: string;
    vehiclePlaqueNo?: string;
    vehiclePlaqueType?: PlaqueType;
    vehiclePlaqueStatus?: PlaqueStatus;
    imei: string;
    terminalNumber?: string;
    isDefault: boolean;
    serialNumber?: string;
    simCardNumber?: string;
    remotePassword?: string;
    startDate: Date;
    endDate?: Date;
    isSupportedExtension: boolean;
}
