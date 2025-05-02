import { Point } from "typeorm";
import { TrackingEventLevel } from "../tracking-event.enum";

export interface TrackingEventDomainDto {
    id: number;
    angle?: number;
    altitude?: number;
    speed?: number;
    occurredAt: Date;
    level: TrackingEventLevel;
    isSeen: boolean;
    trackerAssignmentId: number;
    ioParameterId: number;
    trackingExtensionId?: number;
    location?: Point;
    ioParameterValue: string;
}