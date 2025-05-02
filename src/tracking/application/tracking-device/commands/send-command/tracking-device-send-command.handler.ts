import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TrackingDeviceSendCommandCommand } from './tracking-device-send-command.command';
import { AppException, CACHE_CONSTANTS, RMQ_CONSTANT } from 'src/common';
import { TrackerAssignmentError, TrackerAssignmentRepository, TrackingDeviceRepository, TrackerError, TrackingDeviceError } from 'src/tracking/domain';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';


@CommandHandler(TrackingDeviceSendCommandCommand)
export class TrackingDeviceSendCommandCommandHandler implements ICommandHandler<TrackingDeviceSendCommandCommand, void> {
    private readonly logger = new Logger(TrackingDeviceSendCommandCommandHandler.name);

    constructor(
        private readonly amqpConnection: AmqpConnection,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
    ) { }

    async execute(command: TrackingDeviceSendCommandCommand): Promise<void> {

        const dto = command.dto;
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(dto.trackerAssignmentId);
        if (!trackerAssignment) {
            this.logger.debug(`Tracker assignment ${dto.trackerAssignmentId} not found`);
            throw AppException.NotFound(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const trackingDevice = await this.trackingDeviceRepository.getTrackingDeviceById(trackerAssignment.getTrackingDeviceId());
        if (!trackingDevice) {
            this.logger.debug(`Tracking device ${trackingDevice.getId()} not found`);
            throw AppException.NotFound(TrackingDeviceError.TRACKING_DEVICE_NOT_FOUND);
        }

        await this.amqpConnection.publish(RMQ_CONSTANT.COMMAND_DEVICE.EXCHANGE, '', {
            imei: trackingDevice.getImei(),
            command: dto.command,
        });
        this.logger.log(`🚀 Published send command request to broker`);

    }
}