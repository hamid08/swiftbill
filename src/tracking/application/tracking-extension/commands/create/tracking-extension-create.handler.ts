import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
    TrackingExtensionRepository,
    TrackingDeviceRepository,
    TrackingDeviceError,
    TrackingExtension,
    TrackingExtensionError,
    TrackingDevice,
    TrackerAssignmentRepository,
    TrackerAssignmentError
} from "src/tracking/domain";
import { AppException, RMQ_CONSTANT } from "src/common";
import { TrackingExtensionCreateCommand } from "./tracking-extension-create.command";


@CommandHandler(TrackingExtensionCreateCommand)
export class TrackingExtensionCreateCommandHandler
    implements ICommandHandler<TrackingExtensionCreateCommand, void> {

    private readonly logger = new Logger(TrackingExtensionCreateCommandHandler.name);

    constructor(
        @Inject(TrackingExtensionRepository)
        private readonly extensionRepository: TrackingExtensionRepository,
        @Inject(TrackingDeviceRepository)
        private readonly deviceRepository: TrackingDeviceRepository,
        private readonly amqpConnection: AmqpConnection,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(command: TrackingExtensionCreateCommand): Promise<void> {
        const trackingDevice = await this.validateCommand(command);
        await this.createTrackingExtension(command, trackingDevice);
        await this.publishActivationEvent(command, trackingDevice);
    }

    private async validateCommand(command: TrackingExtensionCreateCommand): Promise<TrackingDevice | null> {

        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(command.trackerAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const trackingDevice = await this.deviceRepository.getTrackingDeviceById(trackerAssignment.getTrackingDeviceId());
        if (!trackingDevice) {
            throw AppException.BadRequest(TrackingDeviceError.TRACKING_DEVICE_NOT_FOUND);
        }

        await this.validateExtensionUniqueness(
            command.extensionDto.extensionId,
            trackingDevice.id
        );

        return trackingDevice;
    }

    private async validateExtensionUniqueness(
        extensionId: string,
        deviceId: number
    ): Promise<void> {
        const [existsInSameDevice, usedInOtherDevice] = await Promise.all([
            this.extensionRepository.trackingExtensionExistsInSameDevice(extensionId, deviceId),
            this.extensionRepository.trackingExtensionUsedInOtherDevice(extensionId)
        ]);

        if (existsInSameDevice) {
            throw AppException.BadRequest(
                TrackingExtensionError.TRACKING_EXTENSION_ALREADY_EXISTS_IN_SAME_DEVICE
            );
        }

        if (usedInOtherDevice) {
            throw AppException.BadRequest(
                TrackingExtensionError.TRACKING_EXTENSION_STATUS_ALREADY_USED_IN_OTHER_DEVICE
            );
        }
    }

    private async createTrackingExtension(
        command: TrackingExtensionCreateCommand,
        trackingDevice: TrackingDevice
    ): Promise<TrackingExtension> {
        const extension = TrackingExtension.create(
            trackingDevice.id,
            command.extensionDto
        );
        await this.extensionRepository.createTrackingExtension(extension);
        return extension;
    }

    private async publishActivationEvent(
        command: TrackingExtensionCreateCommand,
        trackingDevice: TrackingDevice
    ): Promise<void> {

        await this.amqpConnection.publish(
            RMQ_CONSTANT.TRACKING_EXTENSION.ACTIVATE.EXCHANGE,
            '',
            {
                extensionId: command.extensionDto.extensionId,
                imei: trackingDevice.getImei(),
            }
        );

        this.logger.log(`🚀 Published tracking extension activation for ${command.extensionDto.extensionId}`);
    }
}