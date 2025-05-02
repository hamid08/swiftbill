import { BatteryChargeStatus, DeviceExtensionStatus, PlaqueStatus, PlaqueType, TrackerType } from "../../enums";

export class TrackerGridResponseDto {
    id: number;
    type: TrackerType;
    vehicle?: TrackerVehicleInfoDto;
    telematics?: TrackerTelematicsDto;
    connection?: TrackerConnectionStatusDto;
    assignment?: TrackerAssignmentDetailsDto;

}

export class TrackerVehicleInfoDto {
    id: number;
    name: string;
    avatar: string;
    identity: string;
    plaqueNo?: string;
    plaqueType?: PlaqueType;
    plaqueStatus: PlaqueStatus;
    companyName?: string;
}

export class TrackerTelematicsDto {
    /** Current battery percentage (0-100) */
    batteryLevel: number;

    /** Current charging status */
    batteryChargeStatus: BatteryChargeStatus;

    /** 
     * Whether the vehicle is currently moving
     * @definition Speed > configured movement threshold (typically >5 km/h) 
     */
    onTheWay: boolean;

    /** 
     * Engine ignition state
     * @definition Whether the vehicle's engine is currently running
     */
    isEngineOn: boolean;
}

export class TrackerConnectionStatusDto {
    isOnline: boolean;
    lastConnectedAt?: Date;
}

export class TrackerAssignmentDetailsDto {
    unreadEvents?: number;
    todaysViolations?: number;
    extensionStatus?: DeviceExtensionStatus;
    assignmentStart: Date;
    assignmentEnd?: Date;
}


