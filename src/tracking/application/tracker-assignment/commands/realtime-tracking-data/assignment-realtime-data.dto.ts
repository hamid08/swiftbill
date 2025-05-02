import { MinimalLocationB2 } from "../../../../domain/common";
import { IoElement } from "../../../../domain/value-objects";

export class AssignmentRealtimeSocketModel {
    location: MinimalLocationB2;
    ioParameters: IoElement[];
    speedParameterValue: number;
    connection: AssignmentRealtimeSocketConectionModel;
}

export class AssignmentRealtimeSocketConectionModel {
    lastConnectedAt?: Date;
    lastTrackedAt?: Date;
}