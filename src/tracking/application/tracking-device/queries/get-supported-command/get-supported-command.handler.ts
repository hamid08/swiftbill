import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackingDeviceRepository, TrackerAssignmentRepository, TrackingDeviceError, TrackerAssignmentError, TrackingModelRepository, TrackingDeviceSupportedCommandDto } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { GetSupportedCommandQuery } from './get-supported-command.query';
import { AppException } from 'src/common';

@QueryHandler(GetSupportedCommandQuery)
export class GetSupportedCommandQueryHandler implements IQueryHandler<GetSupportedCommandQuery, TrackingDeviceSupportedCommandDto> {
    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        @Inject(TrackingModelRepository)
        private readonly trackingModelRepository: TrackingModelRepository,


    ) { }

    async execute(query: GetSupportedCommandQuery): Promise<TrackingDeviceSupportedCommandDto> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackerAssignmentId);
        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }
        const trackingDevice = await this.trackingDeviceRepository.getTrackingDeviceById(trackerAssignment.getTrackingDeviceId());
        if (!trackingDevice) {
            throw AppException.BadRequest(TrackingDeviceError.TRACKING_DEVICE_NOT_FOUND);
        }

        return this.trackingModelRepository.getSupportedCommands(trackingDevice.getModelId());
    }
}   