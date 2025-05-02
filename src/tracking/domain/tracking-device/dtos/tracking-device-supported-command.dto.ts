import { TrackingModelCommand } from "../../tracking-model";

export class TrackingDeviceSupportedCommandDto {
    constructor(
        public readonly commands: TrackingModelCommand[],
    ) {}
}

