import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackerAssignmentError, TrackerAssignmentRepository, TrackerAssignmentUpdateInfo } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException } from 'src/common';
import { TrackerAssignmentUpdateInfoQuery } from './tracker-assignment-update-info.query';


@QueryHandler(TrackerAssignmentUpdateInfoQuery)
export class TrackerAssignmentUpdateInfoQueryHandler implements IQueryHandler<TrackerAssignmentUpdateInfoQuery, TrackerAssignmentUpdateInfo> {
    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: TrackerAssignmentUpdateInfoQuery): Promise<TrackerAssignmentUpdateInfo> {
        const trackerAssignmentUpdateInfo: TrackerAssignmentUpdateInfo | null = await this.trackerAssignmentRepository.getUpdateInfo(query.trackingAssignmentId);
        if (!trackerAssignmentUpdateInfo) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        return trackerAssignmentUpdateInfo;
    }
}   