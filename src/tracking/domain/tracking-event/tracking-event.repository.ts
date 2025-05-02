import { TrackingEvent } from "./tracking-event.entity";
import { BaseGridViewDto, GridViewDto } from "src/common";
import { TrackingEventGridResponseDto, TrackingEventDetailResponseDto, TrackingEventAssignmentGridResponseDto } from "./dtos";
import { TrackingEventFilterType } from "./tracking-event.enum";

export const TrackingEventRepository = Symbol(
    'TrackingEventRepository',
).valueOf();
export interface TrackingEventRepository {
    bulkInsert(events: TrackingEvent[]): Promise<void>;
    hasDuplicateInTimeWindow(event: TrackingEvent): Promise<boolean>;
    getGrid(
        filter: BaseGridViewDto,
        businessExternalId: string,
        filterType: TrackingEventFilterType
    ): Promise<GridViewDto<TrackingEventGridResponseDto>>;
    getDetail(id: number): Promise<TrackingEventDetailResponseDto | null>;
    getTrackingEventById(id: number): Promise<TrackingEvent | null>;
    getAssignmentGrid(
        filter: BaseGridViewDto,
        trackerAssignmentId: number,
        fromDate?: Date,
        toDate?: Date
    ): Promise<GridViewDto<TrackingEventAssignmentGridResponseDto>>;
    markAsRead(ids: number[]): Promise<void>;
}
