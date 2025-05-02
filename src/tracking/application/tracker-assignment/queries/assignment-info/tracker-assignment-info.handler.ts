import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackerAssignmentError, TrackerAssignmentRepository, TrackerAssignmentInfoDto } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException } from 'src/common';
import { TrackerAssignmentInfoQuery } from './tracker-assignment-info.query';


@QueryHandler(TrackerAssignmentInfoQuery)
export class TrackerAssignmentInfoQueryHandler implements IQueryHandler<TrackerAssignmentInfoQuery, TrackerAssignmentInfoDto> {
    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: TrackerAssignmentInfoQuery): Promise<TrackerAssignmentInfoDto> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackingAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const trackerAssignmentInfo: TrackerAssignmentInfoDto | null = await this.trackerAssignmentRepository.getInfo(query.trackingAssignmentId);
        if (!trackerAssignmentInfo) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        return trackerAssignmentInfo;
    }
}   