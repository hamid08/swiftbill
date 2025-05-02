import { ActiveStatus } from "../../enums";

export interface TrackingDeviceDomainDto {
    id: number;
    imei: string;
    serialNumber?: string;
    simNumber?: string;
    remotePassword?: string;
    identity?: string;
    activeStatus: ActiveStatus;
    modelId: number;
    businessId: number;
}