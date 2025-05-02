import { BaseGridViewDto, GridViewDto } from "src/common";
import {
    TrackerAssignmentDevicesRegisterationDto, TrackerAssignmentGridResponseDto, TrackerAssignmentUpdateInfo,
    TrackerAssignmentInfoDto, TrackerAssignmentStatusDto
} from "./dtos";
import { TrackerAssignment } from "./tracker-assignment.entity";
import { MinimalLocationB1, MinimalLocationB3 } from "../common";
export const TrackerAssignmentRepository = Symbol(
    'TrackerAssignmentRepository',
).valueOf();
export interface TrackerAssignmentRepository {
    createTrackerAssignment(trackerAssignment: TrackerAssignment): Promise<TrackerAssignment>;
    findActiveDefaultAssignmentByImei(imei: string): Promise<TrackerAssignment | null>;
    findActiveDefaultAssignmentByVehicleId(vehicleId: number): Promise<TrackerAssignment | null>;
    findActiveAssignmentByImei(imei: string): Promise<TrackerAssignment | null>;
    getTrackerAssignmentByTerminalNumber(terminalNumber: string): Promise<TrackerAssignment | null>;
    getActiveTrackerAssignmentByTerminalNumber(terminalNumber: string): Promise<TrackerAssignment | null>;
    getByTrackerAssignmentId(trackerAssignmentId: number): Promise<TrackerAssignment | null>;
    existsByTerminalNumber(terminalNumber: string): Promise<boolean>;
    getActiveDevicesForRegisteration(pageIndex: number, pageSize: number): Promise<TrackerAssignmentDevicesRegisterationDto[]>;
    grid(filter: BaseGridViewDto, businessExternalId: string): Promise<GridViewDto<TrackerAssignmentGridResponseDto>>;
    endAssignment(trackerAssignment: TrackerAssignment): Promise<void>;
    findOneActiveAssignmentByTrackerId(trackerId: number): Promise<TrackerAssignment | null>;
    changeToDefaultAssignment(trackerAssignment: TrackerAssignment): Promise<void>;
    hasLatestData(trackerAssignmentId: number): Promise<boolean>;
    updateTrackerAssignment(trackerAssignment: TrackerAssignment): Promise<void>;
    clearDefaultAssignmentsForTracker(trackerId: number): Promise<void>;
    getUpdateInfo(trackerAssignmentId: number): Promise<TrackerAssignmentUpdateInfo | null>;
    findAssignmentByImei(imei: string): Promise<TrackerAssignment | null>;
    getLatestLocation(trackerAssignmentId: number): Promise<MinimalLocationB1 | null>;
    existsTrackerAssignment(trackerAssignmentId: number): Promise<boolean>;
    getInfo(trackerAssignmentId: number): Promise<TrackerAssignmentInfoDto | null>;
    getStatus(trackerAssignmentId: number, fetchAllIoParameters: boolean): Promise<TrackerAssignmentStatusDto | null>;
    getDefaultAssignmentTrackingDataWithTerminalNumber(terminalNumber: string): Promise<MinimalLocationB3 | null>;
}
