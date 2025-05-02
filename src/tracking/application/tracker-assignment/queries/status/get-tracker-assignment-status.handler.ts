import { Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackerAssignmentError, TrackerAssignmentRepository, TrackerAssignmentStatusDto } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException } from 'src/common';
import { GetTrackerAssignmentStatusQuery } from './get-tracker-assignment-status.query';


@QueryHandler(GetTrackerAssignmentStatusQuery)
export class GetTrackerAssignmentStatusQueryHandler implements IQueryHandler<GetTrackerAssignmentStatusQuery, TrackerAssignmentStatusDto> {
    private readonly logger = new Logger(GetTrackerAssignmentStatusQueryHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: GetTrackerAssignmentStatusQuery): Promise<TrackerAssignmentStatusDto> {

        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackingAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const trackerAssignmentStatus: TrackerAssignmentStatusDto | null = await this.trackerAssignmentRepository
            .getStatus(query.trackingAssignmentId, query.fetchAllIoParameters);

        if (!trackerAssignmentStatus) {
            this.logger.warn(TrackerAssignmentError.TrackerAssignmentNotFound);
            return new TrackerAssignmentStatusDto();
        }

        return trackerAssignmentStatus;
    }
}   