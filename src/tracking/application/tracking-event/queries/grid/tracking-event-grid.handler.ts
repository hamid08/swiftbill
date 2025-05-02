import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GridViewDto } from "src/common";
import { TrackingEventGridResponseDto, TrackingEventRepository } from "src/tracking/domain";
import { TrackingEventGridQuery } from "./tracking-event-grid.query";


@QueryHandler(TrackingEventGridQuery)
export class TrackingEventGridQueryHandler
    implements IQueryHandler<TrackingEventGridQuery, GridViewDto<TrackingEventGridResponseDto>> {
    private readonly logger = new Logger(TrackingEventGridQueryHandler.name);

    constructor(
        @Inject(TrackingEventRepository)
        private readonly trackingEventRepository: TrackingEventRepository,
    ) { }

    async execute(query: TrackingEventGridQuery): Promise<GridViewDto<TrackingEventGridResponseDto>> {
        const grid = await this.trackingEventRepository.getGrid(query.filter, query.businessExternalId, query.filterType);
        await this.markAsRead(grid.list.map(item => item.id));
        return grid;
    }

    async markAsRead(ids: number[]): Promise<void> {
        await this.trackingEventRepository.markAsRead(ids);
    }
}