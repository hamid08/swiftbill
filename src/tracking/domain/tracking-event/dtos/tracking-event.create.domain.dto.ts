import { IoElement } from "../../value-objects";
import { TrackingEventLevel } from "../tracking-event.enum";

export interface TrackingEventCreateDomainDto {
    angle?: number;
    altitude?: number;
    speed?: number;
    occurredAt: Date;
    level: TrackingEventLevel;
    trackerAssignmentId: number;
    ioParameterId: number;
    trackingExtensionId?: number;
    latitude?: number;
    longitude?: number;
    ioParameterValue: string;
}