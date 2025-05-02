import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
    TrackerAssignment,
    TrackerAssignmentError,
    TrackingDeviceRepository,
    TrackerAssignmentRepository
} from "src/tracking/domain";
import { EndTrackerAssignmentCommand } from "./end-tracker-assignment.command";
import { AppException, RMQ_CONSTANT } from "src/common";

@CommandHandler(EndTrackerAssignmentCommand)
export class EndTrackerAssignmentCommandHandler
    implements ICommandHandler<EndTrackerAssignmentCommand, void> {

    private readonly logger = new Logger(EndTrackerAssignmentCommandHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async execute(command: EndTrackerAssignmentCommand): Promise<void> {
        const trackerAssignment = await this.validateAndGetAssignment(command.trackerAssignmentId);

        await this.endAssignment(trackerAssignment);

        if (trackerAssignment.getIsDefault()) {
            await this.handleDefaultAssignmentReplacement(trackerAssignment);
        }

        await this.publishDeviceUnregistration(trackerAssignment);
    }

    private async validateAndGetAssignment(trackerAssignmentId: number): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(trackerAssignmentId);

        if (!trackerAssignment) {
            throw AppException.NotFound(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        if (trackerAssignment.getEndDate()) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentAlreadyEnded);
        }

        return trackerAssignment;
    }

    private async endAssignment(trackerAssignment: TrackerAssignment): Promise<void> {
        await this.trackerAssignmentRepository.endAssignment(
            TrackerAssignment.endAssignment(trackerAssignment.getId())
        );
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