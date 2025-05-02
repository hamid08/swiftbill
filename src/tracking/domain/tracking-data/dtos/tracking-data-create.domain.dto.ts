import { IoElement } from "../../value-objects";

export interface TrackingDataCreateDomainDto {
    imei: string;
    terminalNumber: string;
    extensionId?: string;
    trafficDate: Date;
    altitude?: number;
    angle?: number;
    latitude?: number;
    longitude?: number;
    speed?: number;
    ioElements?: IoElement[];
}
