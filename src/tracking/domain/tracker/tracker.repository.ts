import { GetNearbyVehicleRequestDto, TrackerCategoryViewMode, TrackerStatusFilter, UserAccessibleDto } from "src/tracking";
import {
    TrackerGridResponseDto, TrackerMinimalLatestDataResponseDto,
    TrackerSummaryStatusDto,
    TrackerAssignmentListItemDto,
    TrackerLatestLocationDto,
    GetVehicleTrackingInfoResponseDto,
    NearbyTrackerResponseDto,
} from "./dtos";
import { Tracker } from "./tracker.entity";
import { BaseGridViewDto, GridViewDto } from "src/common";

export const TrackerRepository = Symbol(
    'TrackerRepository',
).valueOf();
export interface TrackerRepository {

    createTracker(tracker: Tracker): Promise<Tracker>;
    updateLocation(imei: string, tracker: Tracker): Promise<void>;
    getByTrackerId(trackerId: number): Promise<Tracker | null>;
    getLatestTracingDataByImei(imei: string): Promise<TrackerMinimalLatestDataResponseDto | null>;
    getByVehicleId(vehicleId: number): Promise<Tracker | null>;
    getGrid(
        userAccessibles: UserAccessibleDto,
        businessExternalId: string,
        filter: BaseGridViewDto,
        categoryViewMode: TrackerCategoryViewMode,
        statusFilter: TrackerStatusFilter,
        preVehicleAvatarUrl: string,
        minToDetectIsOnline: number,
        trackerId?: number,
    ): Promise<GridViewDto<TrackerGridResponseDto>>;
    getTrackerSummaryStatus(userAccessibles: UserAccessibleDto,businessExternalId: string, minToDetectIsOnline: number): Promise<TrackerSummaryStatusDto>;
    getAssignmentList(trackerId: number, categoryViewMode: TrackerCategoryViewMode): Promise<TrackerAssignmentListItemDto[]>;
    getTrackersLatestLocation(userAccessibles: UserAccessibleDto,businessExternalId: string, minToDetectIsOnline: number): Promise<TrackerLatestLocationDto[]>;
    findNearbyTrackers(dto: GetNearbyVehicleRequestDto, minToDetectIsOnline: number): Promise<NearbyTrackerResponseDto>;
    getVehicleTrackingInfo(vehicleIds: string[]): Promise<GetVehicleTrackingInfoResponseDto[]>;
}       
