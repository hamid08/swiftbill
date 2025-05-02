import { ActiveStatus } from "src/tracking/domain";

export interface RegisterTrackingDeviceBrokerModel {
    isDelete: boolean;
    isMobile: boolean;
    imei: string;
    serial: string;
    caption: string;
    simCardNumber: string;
    remoteDynamicPassword: string;
    deviceIdentity: string;
    description: string;
    modelId: string;
    terminalNo: string;
    activeStatus: ActiveStatus;
}

