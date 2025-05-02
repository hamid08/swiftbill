import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AppException, GeneratorUtils, RMQ_CONSTANT } from "src/common";
import { TrackerAssignmentMobileCommand } from "./tracker-assignment-mobile.command";
import {
    TrackingDeviceRepository,
    Tracker,
    TrackerAssignmentRepository,
    TrackerRepository,
    TrackerType,
    Vehicle,
    VehicleRepository,
    TrackingDevice,
    TrackingModel,
    TrackingModelRepository,
    TrackingModelError,
    TrackerAssignment,
    ActiveStatus,
    TrackerAssignmentError,
    TrackingDeviceError,
    BusinessRepository,
    DeviceBrandingNameDomainUtils
} from "src/tracking/domain";
import { TrackerAssignmentMobileResultModel } from "./tracker-assignment-mobile.models";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { RegisterTrackingDeviceBrokerModel } from "src/tracking/application";
import chunk from 'lodash/chunk';

interface AssignmentResult {
    trackingDevice: TrackingDevice;
    trackerAssignment: TrackerAssignment;
    modelExternalId: string;
    brandingName: string;
}

interface TrackerCreationResult {
    tracker: Tracker;
    vehicle: Vehicle;
    newTracker: boolean;
}

@CommandHandler(TrackerAssignmentMobileCommand)
export class TrackerAssignmentMobileCommandHandler
    implements ICommandHandler<TrackerAssignmentMobileCommand, TrackerAssignmentMobileResultModel> {

    private readonly logger = new Logger(TrackerAssignmentMobileCommandHandler.name);
    private readonly DEFAULT_CHUNK_SIZE = 100;
    private readonly MAX_TERMINAL_NUMBER_ATTEMPTS = 10;

    constructor(
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
        @Inject(TrackingModelRepository)
        private readonly trackingModelRepository: TrackingModelRepository,
        @Inject(BusinessRepository)
        private readonly businessRepository: BusinessRepository,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async execute(command: TrackerAssignmentMobileCommand): Promise<TrackerAssignmentMobileResultModel> {
        const resultModel = this.createInitialResultModel();
        const trackingMobileModel = await this.validateMobileModel();

        const business = await this.businessRepository.getByExternalId(command.businessExternalId);

        if (!business) throw AppException.BadRequest('کسب و کار یافت نشد');

        if (command.isVehicleSync) {
            await this.processVehicleSync(command, trackingMobileModel, resultModel, business.getId());
        } else {
            await this.processRegularAssignment(command, trackingMobileModel, resultModel, business.getId());
        }

        return resultModel;
    }

    private createInitialResultModel(): TrackerAssignmentMobileResultModel {
        return {
            failedAssignments: { total: 0, errors: [] },
            successAssignments: { total: 0 }
        };
    }

    private async processVehicleSync(
        command: TrackerAssignmentMobileCommand,
        trackingMobileModel: TrackingModel,
        resultModel: TrackerAssignmentMobileResultModel,
        businessId: number,
    ): Promise<void> {
        const { vehicleSyncDto, businessExternalId } = command;
        const externalIdChunks = chunk(vehicleSyncDto.externalIds, this.DEFAULT_CHUNK_SIZE);

        for (const externalIdChunk of externalIdChunks) {
            try {
                const vehicles = await this.vehicleRepository.getVehiclesByExternalIds(externalIdChunk);
                await this.processVehicleBatch(
                    vehicles,
                    businessId,
                    vehicleSyncDto.isDefault,
                    trackingMobileModel,
                    resultModel
                );
            } catch (error) {
                this.handleChunkError(error, externalIdChunk, resultModel);
            }
        }
    }


    private async processRegularAssignment(
        command: TrackerAssignmentMobileCommand,
        trackingMobileModel: TrackingModel,
        resultModel: TrackerAssignmentMobileResultModel,
        businessId: number,
    ): Promise<void> {
        const { dto } = command;
        const vehicleIdChunks = chunk(dto.vehicleIds, this.DEFAULT_CHUNK_SIZE);

        for (const idChunk of vehicleIdChunks) {
            try {
                const vehicles = await this.vehicleRepository.getVehiclesByIds(idChunk);
                await this.processVehicleBatch(
                    vehicles,
                    businessId,
                    dto.isDefault,
                    trackingMobileModel,
                    resultModel
                );
            } catch (error) {
                this.handleChunkError(error, idChunk, resultModel);
            }
        }
    }

    private async processVehicleBatch(
        vehicles: Vehicle[],
        businessId: number,
        isDefault: boolean,
        trackingMobileModel: TrackingModel,
        resultModel: TrackerAssignmentMobileResultModel
    ): Promise<void> {
        const brandingName = DeviceBrandingNameDomainUtils.getBrandingName(trackingMobileModel);
        const successfulAssignments: AssignmentResult[] = [];

        await Promise.all(vehicles.map(async (vehicle) => {
            try {
                const assignment = await this.processSingleVehicleAssignment(
                    vehicle,
                    businessId,
                    isDefault,
                    trackingMobileModel
                );
                successfulAssignments.push(assignment);
                resultModel.successAssignments.total++;
            } catch (error) {
                this.handleVehicleError(error, vehicle.getImei(), resultModel);
            }
        }));

        if (successfulAssignments.length > 0) {
            await this.publishAssignmentsToBroker(
                successfulAssignments,
                trackingMobileModel.getExternalId(),
                brandingName
            );
        }
    }

    private async processSingleVehicleAssignment(
        vehicle: Vehicle,
        businessId: number,
        isDefault: boolean,
        trackingMobileModel: TrackingModel
    ): Promise<AssignmentResult> {
        await this.validateExistingAssignment(vehicle.getImei());

        const { tracker } = await this.ensureTrackerExists(vehicle);
        const trackingDevice = await this.ensureTrackingDeviceExists(
            vehicle,
            businessId,
            trackingMobileModel.getId()
        );

        const terminalNumber = await this.generateUniqueTerminalNumber();
        const trackerAssignment = await this.createTrackerAssignment(
            tracker.getId(),
            trackingDevice.getId(),
            terminalNumber,
            isDefault
        );

        return {
            trackingDevice,
            trackerAssignment,
            modelExternalId: trackingMobileModel.getExternalId(),
            brandingName: DeviceBrandingNameDomainUtils.getBrandingName(trackingMobileModel)
        };
    }

    private async ensureTrackerExists(vehicle: Vehicle): Promise<TrackerCreationResult> {
        if (vehicle.getTrackerId()) {
            const tracker = await this.trackerRepository.getByTrackerId(vehicle.getTrackerId()!);
            return { tracker, vehicle, newTracker: false };
        }

        const newTracker = Tracker.create({
            businessId: vehicle.getBusinessId(),
            vehicleId: vehicle.getId(),
            type: TrackerType.Vehicle,
        });
        const tracker = await this.trackerRepository.createTracker(newTracker);
        vehicle.setTrackerId(tracker.getId());
        await this.vehicleRepository.updateTrackerId(vehicle.getId(), vehicle.getTrackerId());
        return { tracker, vehicle, newTracker: true };
    }

    private async ensureTrackingDeviceExists(
        vehicle: Vehicle,
        businessId: number,
        modelId: number
    ): Promise<TrackingDevice> {
        const trackingDevice = await this.trackingDeviceRepository.getByImei(vehicle.getImei());

        if (!trackingDevice) {
            const newDevice = TrackingDevice.create({
                businessId,
                imei: vehicle.getImei(),
                modelId,
            });
            return this.trackingDeviceRepository.createTrackingDevice(newDevice);
        }

        if (trackingDevice.getModelId() !== modelId) {
            throw AppException.BadRequest(TrackingDeviceError.DeviceModelMismatch(vehicle.getImei()));
        }

        return trackingDevice;
    }

    private async publishAssignmentsToBroker(
        assignments: AssignmentResult[],
        modelExternalId: string,
        defaultBrandingName: string
    ): Promise<void> {
        const messages: RegisterTrackingDeviceBrokerModel[] = assignments.map(assignment => this.createBrokerMessage(
            assignment,
            modelExternalId,
            defaultBrandingName
        ));

        try {
            await this.amqpConnection.publish(
                RMQ_CONSTANT.REGISTER_DEVICES.EXCHANGE,
                '',
                messages
            );
        } catch (error) {
            this.logger.error('Failed to publish assignments to tracking system', error.stack);
            throw new Error('Failed to publish assignments to tracking system');
        }
    }

    private createBrokerMessage(
        assignment: AssignmentResult,
        modelExternalId: string,
        defaultBrandingName: string
    ): RegisterTrackingDeviceBrokerModel {
        return {
            activeStatus: ActiveStatus.Active,
            caption: assignment.brandingName || defaultBrandingName,
            description: '',
            deviceIdentity: '',
            isDelete: false,
            isMobile: true,
            imei: assignment.trackingDevice.getImei(),
            modelId: assignment.modelExternalId || modelExternalId,
            remoteDynamicPassword: '',
            serial: '',
            simCardNumber: '',
            terminalNo: assignment.trackerAssignment.getTerminalNumber(),
        };
    }

    private async validateMobileModel(): Promise<TrackingModel> {
        const trackingMobileModel = await this.trackingModelRepository.getMobileModel();
        if (!trackingMobileModel) {
            throw AppException.BadRequest(TrackingModelError.MobileModelNotFound);
        }
        return trackingMobileModel;
    }

    private async validateExistingAssignment(imei: string): Promise<void> {
        if (!imei) {
            throw AppException.BadRequest(TrackerAssignmentError.InvalidImei(imei));
        }
        const existingAssignment = await this.trackerAssignmentRepository.findActiveAssignmentByImei(imei);
        if (existingAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.DeviceAlreadyAssigned(imei));
        }
    }

    private async generateUniqueTerminalNumber(): Promise<string> {
        for (let attempts = 0; attempts < this.MAX_TERMINAL_NUMBER_ATTEMPTS; attempts++) {
            const terminalNumber = GeneratorUtils.generateTerminalNumber("MB");
            if (!await this.trackerAssignmentRepository.existsByTerminalNumber(terminalNumber)) {
                return terminalNumber;
            }
        }
        throw AppException.BadRequest(TrackerAssignmentError.FailedToGenerateUniqueTerminalNumber);
    }

    private async createTrackerAssignment(
        trackerId: number,
        trackingDeviceId: number,
        terminalNumber: string,
        isDefault: boolean
    ): Promise<TrackerAssignment> {
        const assignment = TrackerAssignment.create({
            trackerId,
            trackingDeviceId,
            terminalNumber,
            isDefault,
        });
        return this.trackerAssignmentRepository.createTrackerAssignment(assignment);
    }

    private handleVehicleError(
        error: Error,
        imei: string,
        resultModel: TrackerAssignmentMobileResultModel
    ): void {
        resultModel.failedAssignments.errors.push(`IMEI ${imei}: ${error.message}`);
        resultModel.failedAssignments.total++;
        this.logger.error(`Error processing vehicle with IMEI ${imei}:`, error.message);
    }

    private handleChunkError(
        error: Error,
        vehicleIds: number[],
        resultModel: TrackerAssignmentMobileResultModel
    ): void {
        this.logger.error(`Error processing vehicle chunk: ${error.message}`, error.stack);
        vehicleIds.forEach(id => {
            resultModel.failedAssignments.errors.push(`Failed to process vehicle ID ${id}: ${error.message}`);
            resultModel.failedAssignments.total++;
        });
    }
}