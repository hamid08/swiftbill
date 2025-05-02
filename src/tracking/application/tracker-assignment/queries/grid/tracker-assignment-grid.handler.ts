import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GridViewDto } from "src/common";
import { TrackerAssignmentGridResponseDto, TrackerAssignmentRepository, UserGridResponseDto } from "src/tracking/domain";
import { TrackerAssignmentGridQuery } from "./tracker-assignment-grid.query";


@QueryHandler(TrackerAssignmentGridQuery)
export class TrackerAssignmentGridQueryHandler
    implements IQueryHandler<TrackerAssignmentGridQuery, GridViewDto<TrackerAssignmentGridResponseDto>> {
    private readonly logger = new Logger(TrackerAssignmentGridQueryHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: TrackerAssignmentGridQuery): Promise<GridViewDto<TrackerAssignmentGridResponseDto>> {
        return await this.trackerAssignmentRepository.grid(query.filter, query.businessExternalId);
    }

}