import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException, GridViewDto } from "src/common";
import { TrackerAssignmentRepository, TrackingDeviceRepository, TrackingExtensionGridResponseDto, TrackingExtensionRepository, TrackingDeviceError, TrackerAssignmentError } from "src/tracking/domain";
import { TrackingExtensionGridQuery } from "./tracking-extension-grid.query";


@QueryHandler(TrackingExtensionGridQuery)
export class TrackingExtensionGridQueryHandler
    implements IQueryHandler<TrackingExtensionGridQuery, GridViewDto<TrackingExtensionGridResponseDto>> {
    private readonly logger = new Logger(TrackingExtensionGridQueryHandler.name);

    constructor(
        @Inject(TrackingExtensionRepository)
        private readonly trackingExtensionRepository: TrackingExtensionRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: TrackingExtensionGridQuery): Promise<GridViewDto<TrackingExtensionGridResponseDto>> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackerAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const trackingDevice = await this.trackingDeviceRepository.getTrackingDeviceById(trackerAssignment.getTrackingDeviceId());

        if (!trackingDevice) {
            throw AppException.BadRequest(TrackingDeviceError.TRACKING_DEVICE_NOT_FOUND);
        }

        return await this.trackingExtensionRepository.grid(query.filter, trackingDevice.id);
    }

}