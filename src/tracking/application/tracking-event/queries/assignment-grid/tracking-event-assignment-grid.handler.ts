import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GridViewDto } from "src/common";
import { TrackingEventAssignmentGridResponseDto, TrackingEventRepository } from "src/tracking/domain";
import { TrackingEventAssignmentGridQuery } from "./tracking-event-assignment-grid.query";


@QueryHandler(TrackingEventAssignmentGridQuery)
export class TrackingEventAssignmentGridQueryHandler
    implements IQueryHandler<TrackingEventAssignmentGridQuery, GridViewDto<TrackingEventAssignmentGridResponseDto>> {
    private readonly logger = new Logger(TrackingEventAssignmentGridQueryHandler.name);

    constructor(
        @Inject(TrackingEventRepository)
        private readonly trackingEventRepository: TrackingEventRepository,
    ) { }

    async execute(query: TrackingEventAssignmentGridQuery): Promise<GridViewDto<TrackingEventAssignmentGridResponseDto>> {
        const grid = await this.trackingEventRepository.getAssignmentGrid(query.filter, query.trackerAssignmentId, query.fromDate, query.toDate);
        await this.markAsRead(grid.list.map(item => item.id));
        return grid;
    }

    async markAsRead(ids: number[]): Promise<void> {
        await this.trackingEventRepository.markAsRead(ids);
    }
}