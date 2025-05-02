import { ICommand } from "@nestjs/cqrs";
import { TrackingExtensionStatus } from "src/tracking/domain";

export class TrackingExtensionChangeStatusCommand implements ICommand {
    constructor(
        public readonly trackerAssignmentId: number,
        public readonly trackingExtensionId: number,
        public readonly status: TrackingExtensionStatus) { }
}

