import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
    TrackingExtensionRepository,
    TrackingDeviceRepository,
    TrackingDeviceError,
    TrackingExtension,
    TrackingExtensionError,
    TrackerAssignmentRepository,
    TrackerAssignmentError
} from "src/tracking/domain";
import { AppException } from "src/common";
import { TrackingExtensionUpdateCommand } from "./tracking-extension-update.command";


@CommandHandler(TrackingExtensionUpdateCommand)
export class TrackingExtensionUpdateCommandHandler
    implements ICommandHandler<TrackingExtensionUpdateCommand, void> {

    private readonly logger = new Logger(TrackingExtensionUpdateCommandHandler.name);

    constructor(
        @Inject(TrackingExtensionRepository)
        private readonly extensionRepository: TrackingExtensionRepository,
        @Inject(TrackingDeviceRepository)
        private readonly deviceRepository: TrackingDeviceRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(command: TrackingExtensionUpdateCommand): Promise<void> {
        await this.validateDeviceAndExtensionExist(
            command.trackerAssignmentId,
            command.trackingExtensionId
        );

        const extension = this.createUpdatedExtension(command);
        await this.extensionRepository.updateTrackingExtension(extension);
    }

    private async validateDeviceAndExtensionExist(
        trackerAssignmentId: number,
        extensionId: number
    ): Promise<void> {

        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(trackerAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const [deviceExists, extensionExists] = await Promise.all([
            this.deviceRepository.getTrackingDeviceById(trackerAssignment.getTrackingDeviceId()),
            this.extensionRepository.getTrackingExtensionById(extensionId)
        ]);

        if (!deviceExists) {
            throw AppException.BadRequest(TrackingDeviceError.TRACKING_DEVICE_NOT_FOUND);
        }

        if (!extensionExists) {
            throw AppException.BadRequest(TrackingExtensionError.TRACKING_EXTENSION_NOT_FOUND);
        }
    }

    private createUpdatedExtension(
        command: TrackingExtensionUpdateCommand
    ): TrackingExtension {
        return TrackingExtension.update(
            command.trackingExtensionId,
            command.extensionDto
        );
    }
}