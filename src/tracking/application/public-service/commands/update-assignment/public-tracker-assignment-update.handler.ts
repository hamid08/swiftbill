import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
    TrackingDeviceRepository,
    TrackerAssignmentRepository,
    TrackingDeviceError,
    VehicleRepository,
    TrackingModelRepository,
    TrackingModelError,
    TrackingDevice,
    TrackingModel,
    TrackerAssignment,
    TrackerAssignmentError,
    ActiveStatus,
    Vehicle,
    TrackerError,
    DeviceBrandingNameDomainUtils,
} from "src/tracking/domain";
import { AppException, GeneratorUtils, RMQ_CONSTANT } from "src/common";
import {
    PublicEndTrackerAssignmentCommand,
    PublicRegisterTrackerCommand,
    RegisterTrackingDeviceBrokerModel
} from "src/tracking/application";
import {
    PublicTrackerAssignmentUpdateCommand,
    PublicTrackerAssignmentUpdateDto
} from "./public-tracker-assignment-update.command";

@CommandHandler(PublicTrackerAssignmentUpdateCommand)
export class PublicTrackerAssignmentUpdateCommandHandler
    implements ICommandHandler<PublicTrackerAssignmentUpdateCommand, void> {

    private readonly logger = new Logger(PublicTrackerAssignmentUpdateCommandHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        @Inject(TrackingModelRepository)
        private readonly trackingModelRepository: TrackingModelRepository,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        private readonly amqpConnection: AmqpConnection,
        private readonly commandBus: CommandBus,
    ) { }

    async execute(command: PublicTrackerAssignmentUpdateCommand): Promise<void> {
        const { updateDto, imei } = command;

        if (imei !== updateDto.imei) {
            await this.handleDifferentImeiScenario(imei, updateDto);
        } else {
            await this.handleSameImeiUpdate(updateDto);
        }
    }

    private async handleDifferentImeiScenario(
        fromRouteImei: string,
        updateDto: PublicTrackerAssignmentUpdateDto
    ): Promise<void> {
        await this.commandBus.execute(new PublicEndTrackerAssignmentCommand(fromRouteImei));
        await this.commandBus.execute(new PublicRegisterTrackerCommand(updateDto));
    }

    private async handleSameImeiUpdate(updateDto: PublicTrackerAssignmentUpdateDto): Promise<void> {
        const trackingModel = await this.validateModelExternalId(updateDto.modelId);
        const trackerAssignment = await this.validateTrackerAssignment(updateDto.imei);

        await this.validateVehicle(trackerAssignment, updateDto);
        const trackingDevice = await this.validateTrackingDevice(trackerAssignment);

        const trackingDeviceId = await this.processDeviceUpdate(
            updateDto,
            trackerAssignment,
            trackingDevice,
            trackingModel
        );

        await this.updateTrackerAssignment(trackerAssignment, trackingDeviceId);
    }

    private async validateVehicle(trackerAssignment: TrackerAssignment, updateDto: PublicTrackerAssignmentUpdateDto): Promise<void> {
        const vehicle = await this.vehicleRepository.getVehicleByTrackerId(trackerAssignment.getTrackerId());
        if (vehicle && vehicle.getPlaqueNo() !== updateDto.plaqueNo) {
            throw AppException.BadRequest(TrackerError.NotAllowedToChangeVehicle);
        }
    }

    private async updateTrackerAssignment(
        trackerAssignment: TrackerAssignment,
        trackingDeviceId: number
    ): Promise<void> {
        await this.trackerAssignmentRepository.updateTrackerAssignment(
            TrackerAssignment.updateAssignment(
                trackerAssignment.getId(),
                trackingDeviceId,
                trackerAssignment.getIsDefault()
            )
        );
    }

    private async validateModelExternalId(modelExternalId: string): Promise<TrackingModel> {
        const trackingModel = await this.trackingModelRepository.getTrackingModelByExternalId(modelExternalId);
        if (!trackingModel) {
            throw AppException.BadRequest(TrackingModelError.TrackingModelNotFound);
        }
        return trackingModel;
    }

    private async validateTrackerAssignment(imei: string): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository.findActiveAssignmentByImei(imei);
        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
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
        updateDto: PublicTrackerAssignmentUpdateDto,
        trackerAssignment: TrackerAssignment,
        trackingDevice: TrackingDevice,
        trackingModel: TrackingModel
    ): Promise<number> {
        if (updateDto.imei !== trackingDevice.getImei()) {
            return this.handleDeviceChange(updateDto, trackerAssignment, trackingDevice, trackingModel);
        }

        await this.updateExistingDevice(updateDto, trackingDevice, trackingModel);
        return trackingDevice.getId();
    }

    private async validateDeviceInfoDuplicated(
        serialNumber: string,
        simCardNumber: string,
        excludeDeviceId?: number
    ): Promise<void> {
        const serialExists = await this.trackingDeviceRepository.existBySerialNumber(
            serialNumber,
            excludeDeviceId
        );
        if (serialExists) {
            throw AppException.BadRequest(TrackingDeviceError.DUPLICATE_SERIAL_NUMBER);
        }

        const simExists = await this.trackingDeviceRepository.existBySimCardNumber(
            simCardNumber,
            excludeDeviceId
        );
        if (simExists) {
            throw AppException.BadRequest(TrackingDeviceError.DUPLICATE_SIM_NUMBER);
        }
    }

    private async handleDeviceChange(
        updateDto: PublicTrackerAssignmentUpdateDto,
        trackerAssignment: TrackerAssignment,
        currentDevice: TrackingDevice,
        trackingModel: TrackingModel
    ): Promise<number> {
        await this.validateDeviceChange(updateDto.imei, trackerAssignment.getId());

        const existingDevice = await this.trackingDeviceRepository.getByImei(updateDto.imei);

        if (!existingDevice) {
            await this.validateDeviceInfoDuplicated(updateDto.serial, updateDto.simCardNumber);
            return this.createNewDevice(updateDto, trackerAssignment, currentDevice.getBusinessId(), trackingModel);
        }

        await this.validateDeviceInfoDuplicated(updateDto.serial, updateDto.simCardNumber, existingDevice.getId());
        await this.updateExistingDevice(updateDto, existingDevice, trackingModel);
        return existingDevice.getId();
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
        updateDto: PublicTrackerAssignmentUpdateDto,
        trackerAssignment: TrackerAssignment,
        businessId: number,
        trackingModel: TrackingModel
    ): Promise<number> {
        const newDevice = TrackingDevice.create({
            imei: updateDto.imei,
            businessId,
            modelId: trackingModel.getId(),
            serialNumber: updateDto.serial,
            simNumber: updateDto.simCardNumber,
            identity: '',
            remotePassword: '',
        });

        const savedDevice = await this.trackingDeviceRepository.createTrackingDevice(newDevice);
        await this.publishAssignmentToBroker(savedDevice, trackerAssignment, trackingModel);
        return savedDevice.getId();
    }

    private async updateExistingDevice(
        updateDto: PublicTrackerAssignmentUpdateDto,
        device: TrackingDevice,
        trackingModel: TrackingModel
    ): Promise<void> {
        await this.trackingDeviceRepository.updateTrackingDevice(
            TrackingDevice.update(
                device.getId(),
                trackingModel.getId(),
                updateDto.serial,
                updateDto.simCardNumber,
                '',
                '',
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