import { MinimalLocationB1 } from "../../common";
import { TrackingEventLevel } from "../tracking-event.enum";

export class TrackingEventAssignmentGridResponseDto {
    id: number;
    eventCaption: string;
    eventTime: Date;
    isExtension: boolean;
    level: TrackingEventLevel;
    location: MinimalLocationB1;
}

