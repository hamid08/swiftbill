import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
    TrackerAssignment,
    TrackerAssignmentError,
    TrackingDeviceRepository,
    TrackerAssignmentRepository,
    TripRepository
} from "src/tracking/domain";
import { AppException, RMQ_CONSTANT } from "src/common";
import { PublicEndTrackerAssignmentCommand } from "./public-end-tracker-assignment.command";

@CommandHandler(PublicEndTrackerAssignmentCommand)
export class PublicEndTrackerAssignmentCommandHandler
    implements ICommandHandler<PublicEndTrackerAssignmentCommand, void> {

    private readonly logger = new Logger(PublicEndTrackerAssignmentCommandHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        private readonly amqpConnection: AmqpConnection,
        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
    ) { }

    async execute(command: PublicEndTrackerAssignmentCommand): Promise<void> {
        const trackerAssignment = await this.validateAndGetAssignment(command.imei);

        await this.endAssignment(trackerAssignment);

        if (trackerAssignment.getIsDefault()) {
            await this.handleDefaultAssignmentReplacement(trackerAssignment);
        }

        await this.endTrips(trackerAssignment);

        await this.publishDeviceUnregistration(trackerAssignment);
    }

    private async validateAndGetAssignment(imei: string): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository.findActiveAssignmentByImei(imei);

        if (!trackerAssignment) {
            throw AppException.NotFound(TrackerAssignmentError.TrackerAssignmentNotFound);
        }
        return trackerAssignment;
    }

    private async endAssignment(trackerAssignment: TrackerAssignment): Promise<void> {
        await this.trackerAssignmentRepository.endAssignment(
            TrackerAssignment.endAssignment(trackerAssignment.getId())
        );
    }

    private async endTrips(trackerAssignment: TrackerAssignment): Promise<void> {
        await this.tripRepository.deactivateAllTrips(trackerAssignment.getTrackerId());
    }

    private async handleDefaultAssignmentReplacement(trackerAssignment: TrackerAssignment): Promise<void> {
        const anotherAssignment = await this.trackerAssignmentRepository.findOneActiveAssignmentByTrackerId(
            trackerAssignment.getTrackerId()
        );

        if (anotherAssignment) {
            await this.trackerAssignmentRepository.changeToDefaultAssignment(
                TrackerAssignment.changeToDefaultAssignment(anotherAssignment.getId())
            );
        }
    }

    private async publishDeviceUnregistration(trackerAssignment: TrackerAssignment): Promise<void> {
        const trackingDevice = await this.trackingDeviceRepository.getUnRegistrationModelDeviceById(
            trackerAssignment.getTrackingDeviceId()
        );

        if (!trackingDevice) {
            return;
        }

        const unregistrationMessage = {
            ...trackingDevice,
            terminalNo: trackerAssignment.getTerminalNumber(),
            isDelete: true
        };

        await this.amqpConnection.publish(
            RMQ_CONSTANT.REGISTER_DEVICES.EXCHANGE,
            '',
            [unregistrationMessage]
        );

        this.logger.log(`🚀 Published unregistration device message to broker`);
    }
}