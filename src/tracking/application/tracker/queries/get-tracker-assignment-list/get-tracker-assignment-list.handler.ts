import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    ApplicationSettingRepository,
    TrackerAssignmentListItemDto,
    TrackerError,
    TrackerRepository
} from "src/tracking/domain";
import { GetTrackerAssignmentListQuery } from "./get-tracker-assignment-list.query.js";
import { AppException } from 'src/common';


@QueryHandler(GetTrackerAssignmentListQuery)
export class GetTrackerAssignmentListQueryHandler
    implements IQueryHandler<GetTrackerAssignmentListQuery, TrackerAssignmentListItemDto[]> {

    private readonly logger = new Logger(GetTrackerAssignmentListQueryHandler.name);

    constructor(
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
    ) { }

    async execute(query: GetTrackerAssignmentListQuery): Promise<TrackerAssignmentListItemDto[]> {

        const tracker = await this.trackerRepository.getByTrackerId(query.trackerId);

        if (!tracker) {
            throw AppException.BadRequest(TrackerError.TrackerNotFound);
        }

        const assignments = await this.trackerRepository.getAssignmentList(query.trackerId, query.categoryViewMode);

        return assignments;
    }


}