import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { AppException } from 'src/common';
import {
    PlaqueStatus, Vehicle, VehicleRepository,
    BusinessRepository,
    TrackerAssignmentMobileVehicleSyncDto,
    Business,
} from 'src/tracking/domain';
import { TrackerAssignmentMobileCommand } from '../../../tracker-assignment/commands/mobile';
import { TransportVehicleBrokerSyncCommand } from './transport-vehicle-broker-sync.command';
import { TransportVehicleBrokerSyncModel } from './transport-vehicle-broker-sync.models';

@CommandHandler(TransportVehicleBrokerSyncCommand)
@Injectable()
export class TransportVehicleBrokerSyncCommandHandler 
    implements ICommandHandler<TransportVehicleBrokerSyncCommand, void> {
    
    private readonly logger = new Logger(TransportVehicleBrokerSyncCommandHandler.name);

    constructor(
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        @Inject(BusinessRepository)
        private readonly businessRepository: BusinessRepository,
        private readonly commandBus: CommandBus,
    ) { }

    async execute(command: TransportVehicleBrokerSyncCommand): Promise<void> {
        try {
            const business = await this.validateBusiness(command.data.businessId);
            const vehicleExternalId = await this.upsertVehicle(command.data, business.getId());
            
            if (vehicleExternalId) {
                await this.assignTrackerToVehicle(vehicleExternalId, business.getExternalId());
            }
        } catch (error) {
            this.logger.error(`Failed to process vehicle sync: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async validateBusiness(externalId: string): Promise<Business> {
        const business = await this.businessRepository.getByExternalId(externalId);
        if (!business) {
            throw AppException.BadRequest(
                'No businesses found - Please sync businesses first in broker',
            );
        }
        return business;
    }

    private async upsertVehicle(
        vehicleData: TransportVehicleBrokerSyncModel,
        businessId: number
    ): Promise<string | undefined> {
        if (!vehicleData) {
            this.logger.warn('No vehicle data provided in command');
            return undefined;
        }

        const vehicle = this.createVehicleEntity(vehicleData, businessId);
        await this.vehicleRepository.upsertVehicles([vehicle]);
        return vehicle.getExternalId();
    }

    private createVehicleEntity(
        vehicleData: TransportVehicleBrokerSyncModel,
        businessId: number
    ): Vehicle {
        return Vehicle.create({
            businessId,
            externalId: vehicleData.vehicleId,
            identity: vehicleData.identity,
            plaqueStatus: vehicleData.plaqueNo ? PlaqueStatus.HasPlaque : PlaqueStatus.NoPlaque,
            plaqueType: vehicleData.plaqueType,
            name: vehicleData.name,
            plaqueNo: vehicleData.plaqueNo,
            userTypeId: vehicleData.vehicleUserTypeId,
            userTypeName: vehicleData.vehicleUserTypeCaption,
            vehicleModelId: vehicleData.vehicleModelId,
            vehicleModelName: vehicleData.vehicleModelCaption,
            companyName: vehicleData.companyName,
            image: vehicleData.image,
            imei: vehicleData.imei,
        });
    }

    private async assignTrackerToVehicle(
        vehicleExternalId: string, 
        businessExternalId: string
    ): Promise<void> {
        this.logger.debug('Starting Assignment Mobile Device Process...');
        
        const vehicleSyncDto: TrackerAssignmentMobileVehicleSyncDto = {
            externalIds: [vehicleExternalId],
            isDefault: true,
        };

        try {
            await this.commandBus.execute(
                new TrackerAssignmentMobileCommand(
                    businessExternalId, 
                    undefined, 
                    vehicleSyncDto, 
                    true
                ),
            );
        } catch (error) {
            this.logger.error('Error during tracker assignment process', error);
            throw AppException.BadRequest(
                `Vehicles updated successfully, but automatic mobile device assignment failed: ${error.message}`
            );
        }
    }
}