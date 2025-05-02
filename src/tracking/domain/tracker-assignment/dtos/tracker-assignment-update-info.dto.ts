import { PlaqueStatus, PlaqueType } from "../../enums";

export class TrackerAssignmentUpdateInfo {
    id: number;
    imei: string;
    serialNumber: string;
    terminalNumber: string;
    simNumber: string;
    remotePassword?: string;
    identity?: string;
    modelId: number;
    brandId: number;
    isDefault: boolean;
    plaqueNo?: string;
    plaqueType?: PlaqueType;
    plaqueStatus: PlaqueStatus;
}