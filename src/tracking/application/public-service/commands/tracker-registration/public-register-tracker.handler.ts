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
    BusinessRepository,
    DeviceBrandingNameDomainUtils
} from "src/tracking/domain";
import { AppException, GeneratorUtils, RMQ_CONSTANT } from "src/common";
import { RegisterTrackingDeviceBrokerModel } from "src/tracking/application";
import { PublicRegisterTrackerCommand, PublicRegisterTrackerDto } from "./public-register-tracker.command";

@CommandHandler(PublicRegisterTrackerCommand)
export class PublicRegisterTrackerCommandHandler
    implements ICommandHandler<PublicRegisterTrackerCommand, void> {

    private readonly logger = new Logger(PublicRegisterTrackerCommandHandler.name);
    private readonly MAX_TERMINAL_NUMBER_ATTEMPTS = 10;
    private readonly VEHICLE_ID_PREFIX = 'VEH';
    private readonly MAX_VEHICLE_ID_ATTEMPTS = 5;

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
        @Inject(BusinessRepository)
        private readonly businessRepository: BusinessRepository,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async execute(command: PublicRegisterTrackerCommand): Promise<void> {
        const { dto } = command;
        const businesses = await this.validateBusinesses();
        const businessId: number = businesses[0].id;

        await this.validateImeiNotAssigned(dto.imei);
        const trackingModel = await this.validateModelExternalId(dto.modelId);

        const trackingDevice = await this.getOrCreateTrackingDevice(dto, trackingModel.getId(), businessId);
        const vehicleId: number = await this.getOrCreateVehicle(dto, businessId);
        const tracker = await this.getOrCreateTracker(vehicleId, businessId);

        await this.clearDefaultAssignmentsForTracker(tracker.getId());
        const trackerAssignment = await this.createTrackerAssignment(tracker, trackingDevice, true);
        await this.publishAssignmentToBroker(trackingDevice, trackerAssignment, trackingModel);
    }

    private async getOrCreateVehicle(
        dto: PublicRegisterTrackerDto,
        businessId: number
    ): Promise<number> {
        // First check if vehicle with this plaque already exists
        const existingVehicle = await this.vehicleRepository.getVehicleByPlaqueNo(dto.plaqueNo);
        if (existingVehicle) {
            return existingVehicle.getId();
        }

        // Generate unique identifiers
        const externalId = await this.generateUniqueVehicleExternalId();
        const identity = await this.generateUniqueVehicleIdentity(dto.plaqueNo);

        return await this.vehicleRepository.createVehicle(
            Vehicle.create({
                businessId,
                externalId,
                identity,
                plaqueStatus: dto.plaqueStatus,
                plaqueNo: dto.plaqueNo,
                plaqueType: dto.plaqueType,
            })
        );
    }

    private async generateUniqueVehicleExternalId(): Promise<string> {
        for (let attempts = 0; attempts < this.MAX_VEHICLE_ID_ATTEMPTS; attempts++) {
            const externalId = `${this.VEHICLE_ID_PREFIX}-${GeneratorUtils.generateRandomString(10)}`;
            const exists = await this.vehicleRepository.existVehicleByExternalId(externalId);
            if (!exists) {
                return externalId;
            }
        }
        throw AppException.InternalServerError('Failed to generate unique vehicle external ID');
    }

    private async generateUniqueVehicleIdentity(plaqueNo: string): Promise<string> {
        const baseIdentity = `Vehicle-${plaqueNo}`;
        let identity = baseIdentity;
        let counter = 1;

        while (counter < this.MAX_VEHICLE_ID_ATTEMPTS) {
            const exists = await this.vehicleRepository.existVehicleByIdentity(identity);
            if (!exists) {
                return identity;
            }
            identity = `${baseIdentity}-${counter++}`;
        }
        throw AppException.InternalServerError('Failed to generate unique vehicle identity');
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

    private async validateBusinesses() {
        const businesses = await this.businessRepository.getAllBusinesses();
        if (!businesses?.length) {
            throw AppException.BadRequest(
                'کسب و کاری یافت نشد - لطفا ابتدا همگام سازی کسب و کار را انجام دهید',
            );
        }
        return businesses;
    }

    private async validateModelExternalId(modelExternalId: string): Promise<TrackingModel> {
        const trackingModel = await this.trackingModelRepository.getTrackingModelByExternalId(modelExternalId);
        if (!trackingModel) {
            throw AppException.BadRequest(TrackingModelError.TrackingModelNotFound);
        }
        return trackingModel;
    }

    private async validateImeiNotAssigned(imei: string): Promise<void> {
        const existingAssignment = await this.trackerAssignmentRepository.findActiveAssignmentByImei(imei);
        if (existingAssignment) {
            throw AppException.BadRequest(TrackingDeviceError.IMEI_ALREADY_ASSIGNED);
        }
    }

    private async getOrCreateTrackingDevice(
        dto: PublicRegisterTrackerDto,
        trackingModelId: number,
        businessId: number
    ): Promise<TrackingDevice> {
        let trackingDevice = await this.trackingDeviceRepository.getByImei(dto.imei);

        if (!trackingDevice) {
            await this.validateDeviceInfoDuplicated(dto.serial, dto.simCardNumber);


            trackingDevice = TrackingDevice.create({
                imei: dto.imei,
                businessId: businessId,
                modelId: trackingModelId,
                serialNumber: dto.serial,
                simNumber: dto.simCardNumber,
                identity: '',
                remotePassword: '',
            });
            return await this.trackingDeviceRepository.createTrackingDevice(trackingDevice);
        }

        return trackingDevice;
    }

    private async clearDefaultAssignmentsForTracker(trackerId: number): Promise<void> {
        await this.trackerAssignmentRepository.clearDefaultAssignmentsForTracker(
            trackerId
        );
    }

    private async getOrCreateTracker(vehicleId: number, businessId: number): Promise<Tracker> {
        let tracker = await this.trackerRepository.getByVehicleId(vehicleId);
        if (!tracker) {
            tracker = Tracker.create({
                vehicleId: vehicleId,
                businessId: businessId,
                type: TrackerType.Vehicle,
            });
            return await this.trackerRepository.createTracker(tracker);
        }

        await this.vehicleRepository.updateTrackerId(vehicleId, tracker.getId());

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