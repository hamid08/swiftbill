import { TrackingExtension } from "./tracking-extension.entity";
import { BaseGridViewDto, GridViewDto } from "src/common";
import { TrackingExtensionGridResponseDto } from "./dtos";
import { MinimalLocationB1 } from "../common";

export const TrackingExtensionRepository = Symbol(
    'TrackingExtensionRepository',
).valueOf();
export interface TrackingExtensionRepository {
    grid(filter: BaseGridViewDto, trackingDeviceId: number): Promise<GridViewDto<TrackingExtensionGridResponseDto>>;
    updateStatus(trackingExtension: TrackingExtension): Promise<boolean>;
    getTrackingExtensionByExtensionId(extensionId: string): Promise<TrackingExtension | null>;
    getTrackingExtensionById(trackingExtensionId: number): Promise<TrackingExtension | null>;
    createTrackingExtension(trackingExtension: TrackingExtension): Promise<void>;
    updateTrackingExtension(trackingExtension: TrackingExtension): Promise<void>;
    trackingExtensionExistsInSameDevice(extensionId: string, deviceId: number): Promise<boolean>;
    trackingExtensionUsedInOtherDevice(extensionId: string): Promise<boolean>;
    changeStatus(trackingExtension: TrackingExtension): Promise<void>;
    getLatestLocation(trackingExtensionId: number): Promise<MinimalLocationB1 | null>;
    existsTrackingExtension(trackingExtensionId: number): Promise<boolean>;
}
