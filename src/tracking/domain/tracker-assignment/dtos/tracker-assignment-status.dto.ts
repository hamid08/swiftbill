import { MinimalLocationB1, MinimalVehicleInfo } from "../../common";

export class TrackerAssignmentStatusDto {
    location: MinimalLocationB1;
    connection: TrackerAssignmentStatusConnection;
    vehicle?: MinimalVehicleInfo;
    ioParameters?: TrackerAssignmentStatusIoParameters[];
    speedParameterValue: number;
}

export class TrackerAssignmentStatusConnection {
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
}

export class TrackerAssignmentStatusIoParameters {
    id: number;
    isExtension: boolean;
    extensionId?: string;
    name: string;
    value: string;
    unit?: string;
    icon?: string;
}


