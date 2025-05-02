import { LocationType, TrackingDataCheckStage } from "src/tracking";
import { IoElement } from "../../value-objects";

export interface TrackingDataDomainDto {
    id: string;
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
    locationType?: LocationType;
    trackingDataCheckStage?: TrackingDataCheckStage;
}
