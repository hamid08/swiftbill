import { PlaqueStatus, PlaqueType } from "../../enums";

export class TrackingEventGridResponseDto {
    id: number;
    eventTime: Date;
    eventCaption: string;
    vehicleName: string;
    plaqueNo?: string;
    identityNo?: string;
    plaqueStatus?: PlaqueStatus;
    plaqueType?: PlaqueType;
    isSeen: boolean;
}
