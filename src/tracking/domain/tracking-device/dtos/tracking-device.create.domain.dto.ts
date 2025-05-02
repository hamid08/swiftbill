import { ActiveStatus } from "../../enums";

export interface TrackingDeviceCreateDomainDto {
    imei: string;
    serialNumber?: string;
    simNumber?: string;
    remotePassword?: string;
    identity?: string;
    modelId: number;
    businessId: number;
}