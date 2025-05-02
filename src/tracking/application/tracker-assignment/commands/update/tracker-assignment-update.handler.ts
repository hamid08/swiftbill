import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
    TrackingDeviceRepository,
    TrackerAssignmentRepository,
    TrackingDeviceError,
    TrackingModelRepository,
    TrackingModelError,
    TrackingDevice,
    TrackingModel,
    TrackerAssignmentError,
    ActiveStatus,
    TrackerAssignment,
    TrackerAssignmentUpdateDto,
    DeviceBrandingNameDomainUtils,
} from "src/tracking/domain";
import { AppException, GeneratorUtils, RMQ_CONSTANT } from "src/common";
import { RegisterTrackingDeviceBrokerModel } from "src/tracking/application";
import { TrackerAssignmentUpdateCommand } from "./tracker-assignment-update.command";


@CommandHandler(TrackerAssignmentUpdateCommand)
export class TrackerAssignmentUpdateCommandHandler
    implements ICommandHandler<TrackerAssignmentUpdateCommand, void> {

    private readonly logger = new Logger(TrackerAssignmentUpdateCommandHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        @Inject(TrackingModelRepository)
        private readonly trackingModelRepository: TrackingModelRepository,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async execute(command: TrackerAssignmentUpdateCommand): Promise<void> {
        const { updateDto, trackerAssignmentId } = command;

        const trackerAssignment = await this.validateTrackerAssignment(trackerAssignmentId);
        const trackingDevice = await this.validateTrackingDevice(trackerAssignment);

        const trackingDeviceId = await this.processDeviceUpdate(
            updateDto,
            trackerAssignment,
            trackingDevice
        );

        if (updateDto.isDefault !== trackerAssignment.getIsDefault()) {
            if (updateDto.isDefault) {
                await this.clearDefaultAssignmentsForTracker(trackerAssignment);
            }
        }

        await this.trackerAssignmentRepository.updateTrackerAssignment(
            TrackerAssignment.updateAssignment(
                trackerAssignmentId,
                trackingDeviceId,
                updateDto.isDefault
            )
        );
    }

    private async clearDefaultAssignmentsForTracker(trackerAssignment: TrackerAssignment): Promise<void> {
        await this.trackerAssignmentRepository.clearDefaultAssignmentsForTracker(
            trackerAssignment.getTrackerId()
        );
    }


    private async validateTrackerAssignment(trackerAssignmentId: number): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(trackerAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        if (trackerAssignment.getEndDate() != null) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentAlreadyEnded);
        }

        return trackerAssignment;
    }

    private async validateTrackingDevice(trackerAssignment: TrackerAssignment): Promise<TrackingDevice> {
        const trackingDevice = await this.trackingDeviceRepository.getTrackingDeviceById(
            trackerAssignment.getTrackingDeviceId()
        );

        if (!trackingDevice) {
            throw AppException.BadRequest(TrackingDeviceError.TRACKING_DEVICE_NOT_FOUND);
        }

        return trackingDevice;
    }

    private async processDeviceUpdate(
        updateDto: TrackerAssignmentUpdateDto,
        trackerAssignment: TrackerAssignment,
        trackingDevice: TrackingDevice
    ): Promise<number> {
        if (updateDto.imei !== trackingDevice.getImei()) {
            return this.handleDeviceChange(updateDto, trackerAssignment, trackingDevice);
        } else {
            await this.updateExistingDevice(updateDto, trackingDevice);
            return trackingDevice.getId();
        }
    }

    private async validateDeviceInfoDuplicated(
        serialNumber: string,
        simCardNumber: string,
        excludeDeviceId?: number
    ): Promise<void> {
        // Check for duplicate serial number (excluding current device if provided)
        const serialExists = await this.trackingDeviceRepository.existBySerialNumber(
            serialNumber,
            excludeDeviceId
        );
        if (serialExists) {
            throw AppException.BadRequest(TrackingDeviceError.DUPLICATE_SERIAL_NUMBER);
        }

        // Check for duplicate SIM card number (excluding current device if provided)
        const simExists = await this.trackingDeviceRepository.existBySimCardNumber(
            simCardNumber,
            excludeDeviceId
        );
        if (simExists) {
            throw AppException.BadRequest(TrackingDeviceError.DUPLICATE_SIM_NUMBER);
        }
    }

    private async handleDeviceChange(
        updateDto: TrackerAssignmentUpdateDto,
        trackerAssignment: TrackerAssignment,
        currentDevice: TrackingDevice
    ): Promise<number> {
        await this.validateDeviceChange(updateDto.imei, trackerAssignment.getId());

        const existingDevice = await this.trackingDeviceRepository.getByImei(updateDto.imei);

        if (!existingDevice) {
            await this.validateDeviceInfoDuplicated(updateDto.serialNumber, updateDto.simNumber);
            return this.createNewDevice(updateDto, trackerAssignment, currentDevice.getBusinessId());
        } else {
            await this.validateDeviceInfoDuplicated(updateDto.serialNumber, updateDto.simNumber, existingDevice.getId());
            await this.updateExistingDevice(updateDto, existingDevice);
            return existingDevice.getId();
        }
    }

    private async validateDeviceChange(imei: string, trackerAssignmentId: number): Promise<void> {
        const activeAssignment = await this.trackerAssignmentRepository.findActiveAssignmentByImei(imei);
        if (activeAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.DeviceAlreadyAssigned(imei));
        }

        const hasLatestData = await this.trackerAssignmentRepository.hasLatestData(trackerAssignmentId);
        if (hasLatestData) {
            throw AppException.BadRequest(TrackerAssignmentError.ActiveTrackingDataPreventsDeviceChange);
        }
    }

    private async createNewDevice(
        updateDto: TrackerAssignmentUpdateDto,
        trackerAssignment: TrackerAssignment,
        businessId: number
    ): Promise<number> {
        const newDevice = TrackingDevice.create({
            imei: updateDto.imei,
            businessId,
            modelId: updateDto.modelId,
            serialNumber: updateDto.serialNumber,
            simNumber: updateDto.simNumber,
            identity: updateDto.identity,
            remotePassword: updateDto.remotePassword,
        });

        const trackingModel: TrackingModel | null = await this.trackingModelRepository.getTrackingModelById(updateDto.modelId);
        if (!trackingModel) {
            throw AppException.BadRequest(TrackingModelError.TrackingModelNotFound);
        }
        const savedDevice = await this.trackingDeviceRepository.createTrackingDevice(newDevice);

        await this.publishAssignmentToBroker(savedDevice, trackerAssignment, trackingModel);
        return savedDevice.getId();
    }

    private async updateExistingDevice(
        updateDto: TrackerAssignmentUpdateDto,
        device: TrackingDevice
    ): Promise<void> {
        await this.trackingDeviceRepository.updateTrackingDevice(
            TrackingDevice.update(
                device.getId(),
                updateDto.modelId,
                updateDto.serialNumber,
                updateDto.simNumber,
                updateDto.remotePassword,
                updateDto.identity,
            )
        );
    }

    private async publishAssignmentToBroker(
        trackingDevice: TrackingDevice,
        trackerAssignment: TrackerAssignment,
        trackingModel: TrackingModel
    ): Promise<void> {
        const message = this.createBrokerMessage(
            trackingModel,
            trackingDevice,
            trackerAssignment,
            DeviceBrandingNameDomainUtils.getBrandingName(trackingModel)
        );

        try {
            await this.amqpConnection.publish(
                RMQ_CONSTANT.REGISTER_DEVICES.EXCHANGE,
                '',
                [message]
            );
            this.logger.log(`🚀 Published assignment to tracking system`);
        } catch (error) {
            this.logger.error('Failed to publish assignment to tracking system', error.stack);
            throw new Error('Failed to publish assignment to tracking system');
        }
    }

    private createBrokerMessage(
        trackingModel: TrackingModel,
        trackingDevice: TrackingDevice,
        trackerAssignment: TrackerAssignment,
        brandingName: string
    ): RegisterTrackingDeviceBrokerModel {
        return {
            activeStatus: ActiveStatus.Active,
            caption: brandingName,
            description: '',
            deviceIdentity: trackingDevice.getIdentity() || '',
            isDelete: false,
            isMobile: trackingModel.getIsMobile(),
            imei: trackingDevice.getImei(),
            modelId: trackingModel.getExternalId(),
            remoteDynamicPassword: trackingDevice.getRemotePassword() || '',
            serial: trackingDevice.getSerialNumber() || '',
            simCardNumber: trackingDevice.getSimNumber() || '',
            terminalNo: trackerAssignment.getTerminalNumber() || '',
        };
    }
}