import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
    TrackingDeviceRepository,
    TrackerAssignmentRepository,
    TrackingDeviceError,
    VehicleRepository,
    VehicleError,
    TrackingModelRepository,
    TrackingModelError,
    TrackingDevice,
    TrackingModel,
    Vehicle,
    Tracker,
    TrackerRepository,
    TrackerType,
    TrackerAssignmentError,
    ActiveStatus,
    TrackerAssignment,
    TrackerAssignmentCreateDto,
    DeviceBrandingNameDomainUtils
} from "src/tracking/domain";
import { TrackerAssignmentCreateCommand } from "./tracker-assignment-create.command";
import { AppException, GeneratorUtils, RMQ_CONSTANT } from "src/common";
import { RegisterTrackingDeviceBrokerModel } from "src/tracking/application";

@CommandHandler(TrackerAssignmentCreateCommand)
export class TrackerAssignmentCreateCommandHandler
    implements ICommandHandler<TrackerAssignmentCreateCommand, void> {

    private readonly logger = new Logger(TrackerAssignmentCreateCommandHandler.name);
    private readonly MAX_TERMINAL_NUMBER_ATTEMPTS = 10;

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        @Inject(TrackingModelRepository)
        private readonly trackingModelRepository: TrackingModelRepository,
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async execute(command: TrackerAssignmentCreateCommand): Promise<void> {
        const { createDto } = command;

        const vehicle = await this.vehicleRepository.getVehicleById(createDto.vehicleId);
        const trackingModel = await this.trackingModelRepository.getTrackingModelById(createDto.modelId);

        await this.validateInputs(createDto, vehicle, trackingModel);

        const trackingDevice = await this.getOrCreateTrackingDevice(createDto, vehicle);
        const tracker = await this.getOrCreateTracker(vehicle);

        const trackerAssignment = await this.createTrackerAssignment(tracker, trackingDevice, createDto.isDefault);
        await this.publishAssignmentToBroker(trackingDevice, trackerAssignment, trackingModel);
    }

    private async validateInputs(
        dto: TrackerAssignmentCreateDto,
        vehicle: Vehicle | null,
        trackingModel: TrackingModel | null
    ): Promise<void> {
        if (!vehicle) {
            throw AppException.BadRequest(VehicleError.VEHICLE_NOT_FOUND);
        }

        if (!trackingModel) {
            throw AppException.BadRequest(TrackingModelError.TrackingModelNotFound);
        }

        await this.validateImeiNotAssigned(dto.imei);
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

    private async validateImeiNotAssigned(imei: string): Promise<void> {
        const existingAssignment = await this.trackerAssignmentRepository.findActiveAssignmentByImei(imei);
        if (existingAssignment) {
            throw AppException.BadRequest(TrackingDeviceError.IMEI_ALREADY_ASSIGNED);
        }
    }

    private async getOrCreateTrackingDevice(
        dto: TrackerAssignmentCreateDto,
        vehicle: Vehicle
    ): Promise<TrackingDevice> {
        let trackingDevice = await this.trackingDeviceRepository.getByImei(dto.imei);

        if (!trackingDevice) {

            // Validate duplicates
            await this.validateDeviceInfoDuplicated(
                dto.serialNumber,
                dto.simNumber,
            );

            trackingDevice = TrackingDevice.create({
                imei: dto.imei,
                businessId: vehicle.getBusinessId(),
                modelId: dto.modelId,
                serialNumber: dto.serialNumber,
                simNumber: dto.simNumber,
                identity: dto.identity,
                remotePassword: dto.remotePassword,
            });
            return await this.trackingDeviceRepository.createTrackingDevice(trackingDevice);
        }

        return trackingDevice;
    }

    private async getOrCreateTracker(vehicle: Vehicle): Promise<Tracker> {
        let tracker = await this.trackerRepository.getByVehicleId(vehicle.getId());

        if (!tracker) {
            tracker = Tracker.create({
                vehicleId: vehicle.getId(),
                businessId: vehicle.getBusinessId(),
                type: TrackerType.Vehicle,
            });
            return await this.trackerRepository.createTracker(tracker);
        }

        vehicle.setTrackerId(tracker.getId());
        await this.vehicleRepository.updateTrackerId(vehicle.getId(), vehicle.getTrackerId());

        return tracker;
    }

    private async createTrackerAssignment(
        tracker: Tracker,
        trackingDevice: TrackingDevice,
        isDefault: boolean
    ): Promise<TrackerAssignment> {
        const terminalNumber = await this.generateUniqueTerminalNumber();

        const assignment = TrackerAssignment.create({
            trackerId: tracker.getId(),
            trackingDeviceId: trackingDevice.getId(),
            terminalNumber,
            isDefault,
        });

        return this.trackerAssignmentRepository.createTrackerAssignment(assignment);
    }

    private async generateUniqueTerminalNumber(): Promise<string> {
        for (let attempts = 0; attempts < this.MAX_TERMINAL_NUMBER_ATTEMPTS; attempts++) {
            const terminalNumber = GeneratorUtils.generateTerminalNumber("GPS");
            if (!await this.trackerAssignmentRepository.existsByTerminalNumber(terminalNumber)) {
                return terminalNumber;
            }
        }
        throw AppException.BadRequest(TrackerAssignmentError.FailedToGenerateUniqueTerminalNumber);
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
            terminalNo: trackerAssignment.getTerminalNumber(),
        };
    }
}