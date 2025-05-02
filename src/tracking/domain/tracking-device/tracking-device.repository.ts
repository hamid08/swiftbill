import { TrackerAssignmentDevicesRegisterationDto } from "../tracker-assignment";
import { TrackingDeviceCheckByImeiResponse } from "./dtos";
import { TrackingDevice } from "./tracking-device.entity";

export const TrackingDeviceRepository = Symbol(
    'TrackingDeviceRepository',
).valueOf();
export interface TrackingDeviceRepository {
    getCurrentTrackerIdByImei(imei: string): Promise<number | null>;
    getTrackingDeviceById(trackingDeviceId: number): Promise<TrackingDevice | null>;
    getUnRegistrationModelDeviceById(trackingDeviceId: number): Promise<TrackerAssignmentDevicesRegisterationDto | null>;
    getByImei(imei: string): Promise<TrackingDevice | null>;
    createTrackingDevice(trackingDevice: TrackingDevice): Promise<TrackingDevice>;
    checkByImei(imei: string): Promise<TrackingDeviceCheckByImeiResponse | null>;
    updateTrackingDevice(trackingDevice: TrackingDevice): Promise<void>;
    existBySerialNumber(serialNumber: string, excludeDeviceId?: number): Promise<boolean>;
    existBySimCardNumber(serialNumber: string, excludeDeviceId?: number): Promise<boolean>;
}
