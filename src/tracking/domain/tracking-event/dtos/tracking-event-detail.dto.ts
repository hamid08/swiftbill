import { MinimalLocationB1 } from "../../common";
import { PlaqueStatus, PlaqueType } from "../../enums";
import { TrackingEventAttribute } from "../../types";

export class TrackingEventDetailResponseDto {
    id: number;
    trackerId: number;
    vehicleId: number;
    eventTime: Date;
    eventCaption: string;
    vehicleName: string;
    plaqueNo?: string;
    identityNo?: string;
    plaqueStatus?: PlaqueStatus;
    plaqueType?: PlaqueType;
    location: MinimalLocationB1;
    trackerExtensionId?: number;
    attributes: TrackingEventAttribute[];
}


