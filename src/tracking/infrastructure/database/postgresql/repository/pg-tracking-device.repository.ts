import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TrackingDeviceOrmEntity } from '../entities';
import { ActiveStatus, TrackerAssignmentDevicesRegisterationDto, TrackingDevice, TrackingDeviceCheckByImeiResponse, TrackingDeviceRepository } from 'src/tracking/domain';


@Injectable()
export class PgTrackingDeviceRepo extends Repository<TrackingDeviceOrmEntity> implements TrackingDeviceRepository {
    constructor(private dataSource: DataSource) {
        super(TrackingDeviceOrmEntity, dataSource.createEntityManager());
    }

    async existBySerialNumber(serialNumber: string, excludeDeviceId?: number): Promise<boolean> {
        const query = this.createQueryBuilder('device')
            .where('device.serialNumber = :serialNumber', { serialNumber });

        if (excludeDeviceId) {
            query.andWhere('device.id != :excludeDeviceId', { excludeDeviceId });
        }

        return await query.getExists();
    }
    

    async existBySimCardNumber(simNumber: string, excludeDeviceId?: number): Promise<boolean> {
        const query = this.createQueryBuilder('device')
            .where('device.simNumber = :simNumber', { simNumber });

        if (excludeDeviceId) {
            query.andWhere('device.id != :excludeDeviceId', { excludeDeviceId });
        }

        return await query.getExists();
    }

    async updateTrackingDevice(trackingDevice: TrackingDevice): Promise<void> {
        await this.update(trackingDevice.getId(),
            {
                modelId: trackingDevice.getModelId(),
                serialNumber: trackingDevice.getSerialNumber(),
                simNumber: trackingDevice.getSimNumber(),
                identity: trackingDevice.getIdentity(),
                remotePassword: trackingDevice.getRemotePassword(),
            });
    }


    async checkByImei(imei: string): Promise<TrackingDeviceCheckByImeiResponse | null> {
        const result = await this.findOne({ where: { imei }, relations: ['model'] });
        return result ? {
            imei: result.imei,
            serialNumber: result.serialNumber,
            simNumber: result.simNumber,
            remotePassword: result.remotePassword,
            identity: result.identity,
            modelId: result.modelId,
            brandId: result.model.brandId,
        } : null;
    }

    async getUnRegistrationModelDeviceById(trackingDeviceId: number): Promise<TrackerAssignmentDevicesRegisterationDto | null> {
        const result = await this.findOne({ where: { id: trackingDeviceId }, relations: ['model'] });
        return result ? {
            activeStatus: ActiveStatus.Deactive,
            caption: '',
            description: '',
            deviceIdentity: result.identity,
            imei: result.imei,
            isDelete: true,
            isMobile: result.model.isMobile,
            modelId: result.model.externalId,
            remoteDynamicPassword: result.remotePassword,
            serial: result.serialNumber,
            simCardNumber: result.simNumber,
            terminalNo: ''

        } : null;
    }




    async createTrackingDevice(trackingDevice: TrackingDevice): Promise<TrackingDevice> {
        const trackingDeviceOrm = this.mapToOrm(trackingDevice);
        await this.save(trackingDeviceOrm);
        return this.mapToDomain(trackingDeviceOrm);
    }


    private mapToOrm(trackingDevice: TrackingDevice): TrackingDeviceOrmEntity {
        const trackingDeviceOrm = new TrackingDeviceOrmEntity();
        trackingDeviceOrm.imei = trackingDevice.getImei();
        trackingDeviceOrm.serialNumber = trackingDevice.getSerialNumber();
        trackingDeviceOrm.simNumber = trackingDevice.getSimNumber();
        trackingDeviceOrm.remotePassword = trackingDevice.getRemotePassword();
        trackingDeviceOrm.identity = trackingDevice.getIdentity();
        trackingDeviceOrm.activeStatus = trackingDevice.getActiveStatus();
        trackingDeviceOrm.modelId = trackingDevice.getModelId();
        trackingDeviceOrm.businessId = trackingDevice.getBusinessId();
        return trackingDeviceOrm;
    }

    async getByImei(imei: string): Promise<TrackingDevice | null> {
        const result = await this.findOne({ where: { imei } });
        return result ? this.mapToDomain(result) : null;
    }

    async getTrackingDeviceById(trackingDeviceId: number): Promise<TrackingDevice | null> {
        const result = await this.findOne({ where: { id: trackingDeviceId } });
        return result ? this.mapToDomain(result) : null;
    }

    private mapToDomain(entity: TrackingDeviceOrmEntity): TrackingDevice {
        return TrackingDevice.mapToDomain({
            id: entity.id,
            imei: entity.imei,
            serialNumber: entity.serialNumber,
            simNumber: entity.simNumber,
            remotePassword: entity.remotePassword,
            identity: entity.identity,
            activeStatus: entity.activeStatus,
            modelId: entity.modelId,
            businessId: entity.businessId,
        });
    }

    async getCurrentTrackerIdByImei(imei: string): Promise<number | null> {
        const result = await this
            .createQueryBuilder('trackingDevice') // Alias for TrackingDevice
            .innerJoin('trackingDevice.trackerAssignments', 'trackerAssignment') // Join TrackerAssignment
            .innerJoin('trackerAssignment.tracker', 'tracker') // Join Tracker
            .where('trackingDevice.imei = :imei', { imei }) // Filter by imei
            .andWhere('trackerAssignment.endDate IS NULL') // Filter by active assignment
            .select('tracker.id', 'trackerId') // Select trackerId
            .getRawOne<{ trackerId: number }>(); // Get the raw result

        if (!result) {
            throw new Error(`No active assignment found for TrackingDevice with imei ${imei}.`);
        }

        return result.trackerId;
    }

}