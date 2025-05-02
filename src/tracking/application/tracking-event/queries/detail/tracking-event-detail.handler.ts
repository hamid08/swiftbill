import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException, GridViewDto } from "src/common";
import { TrackingEventDetailResponseDto, TrackingEventError, TrackingEventRepository } from "src/tracking/domain";
import { TrackingEventDetailQuery } from "./tracking-event-detail.query";


@QueryHandler(TrackingEventDetailQuery)
export class TrackingEventDetailQueryHandler
    implements IQueryHandler<TrackingEventDetailQuery, TrackingEventDetailResponseDto> {
    private readonly logger = new Logger(TrackingEventDetailQueryHandler.name);

    constructor(
        @Inject(TrackingEventRepository)
        private readonly trackingEventRepository: TrackingEventRepository,
    ) { }

    async execute(query: TrackingEventDetailQuery): Promise<TrackingEventDetailResponseDto> {
        const result = await this.trackingEventRepository.getTrackingEventById(query.id);
        if (!result) {
            throw AppException.BadRequest(TrackingEventError.NotFound);
        }

        await this.markAsRead([query.id]);
        return await this.trackingEventRepository.getDetail(query.id);
    }

    async markAsRead(ids: number[]): Promise<void> {
        await this.trackingEventRepository.markAsRead(ids);
    }
}