import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { TrackingExtensionOrmEntity } from '../entities';
import { MinimalLocationB1, TrackingExtension, TrackingExtensionGridResponseDto, TrackingExtensionRepository, TrackingExtensionStatus } from 'src/tracking/domain';
import { GridViewDto, GridUtilsService, GeoUtils } from 'src/common';
import { BaseGridViewDto } from 'src/common';

@Injectable()
export class PgTrackingExtensionRepo extends Repository<TrackingExtensionOrmEntity> implements TrackingExtensionRepository {
    constructor(
        private dataSource: DataSource,
        private gridUtilsService: GridUtilsService,
    ) {
        super(TrackingExtensionOrmEntity, dataSource.createEntityManager());
    }

    async existsTrackingExtension(trackingExtensionId: number): Promise<boolean> {
        const result = await this.findOne({
            where: {
                id: trackingExtensionId,
            },
        });
        return result !== null;
    }

    async getLatestLocation(trackingExtensionId: number): Promise<MinimalLocationB1 | null> {
        const trackingExtension = await this.findOne({ where: { id: trackingExtensionId }, relations: ['latestData'] });

        return trackingExtension && trackingExtension.latestData && trackingExtension.latestData.length > 0 ? {
            altitude: trackingExtension.latestData[0]?.altitude,
            angle: trackingExtension.latestData[0]?.angle,
            speed: trackingExtension.latestData[0]?.speed,
            lat: GeoUtils.pointToLatLng(trackingExtension.latestData[0]?.location).latitude,
            lng: GeoUtils.pointToLatLng(trackingExtension.latestData[0]?.location).longitude,
        } : null;
    }

    async changeStatus(trackingExtension: TrackingExtension): Promise<void> {
        await this.update(
            { id: trackingExtension.getId() },
            { status: trackingExtension.getStatus(), updateAt: trackingExtension.getUpdatedAt() }
        );
    }

    async getTrackingExtensionById(trackingExtensionId: number): Promise<TrackingExtension | null> {
        const trackingExtension = await this.findOne({ where: { id: trackingExtensionId } });
        return trackingExtension ? this.mapToDomain(trackingExtension) : null;
    }

    async trackingExtensionExistsInSameDevice(extensionId: string, deviceId: number): Promise<boolean> {
        return await this.exists({ where: { extensionId: extensionId, deviceId: deviceId } });
    }

    async trackingExtensionUsedInOtherDevice(extensionId: string): Promise<boolean> {
        return await this.exists({
            where: {
                extensionId: extensionId,
                status: In([
                    TrackingExtensionStatus.Active,
                    TrackingExtensionStatus.Activating,
                    TrackingExtensionStatus.Deactivating
                ])
            }
        });
    }

    private mapTrackingExtensionCreateToOrm(trackingExtension: TrackingExtension): TrackingExtensionOrmEntity {
        const ormEntity = new TrackingExtensionOrmEntity();
        ormEntity.extensionId = trackingExtension.getExtensionId();
        ormEntity.caption = trackingExtension.getCaption();
        ormEntity.description = trackingExtension.getDescription();
        ormEntity.status = trackingExtension.getStatus();
        ormEntity.updateAt = trackingExtension.getUpdatedAt();
        ormEntity.deviceId = trackingExtension.getDeviceId();
        return ormEntity;
    }

    private mapTrackingExtensionUpdateToOrm(trackingExtension: TrackingExtension): TrackingExtensionOrmEntity {
        const ormEntity = new TrackingExtensionOrmEntity();
        ormEntity.id = trackingExtension.getId();
        ormEntity.caption = trackingExtension.getCaption();
        ormEntity.description = trackingExtension.getDescription();
        ormEntity.updateAt = trackingExtension.getUpdatedAt();
        return ormEntity;
    }

    async createTrackingExtension(trackingExtension: TrackingExtension): Promise<void> {
        const ormEntity = this.mapTrackingExtensionCreateToOrm(trackingExtension);
        await this.save(ormEntity);
    }

    async updateTrackingExtension(trackingExtension: TrackingExtension): Promise<void> {
        const ormEntity = this.mapTrackingExtensionUpdateToOrm(trackingExtension);
        await this.save(ormEntity);
    }

    async grid(filter: BaseGridViewDto, trackingDeviceId: number): Promise<GridViewDto<TrackingExtensionGridResponseDto>> {
        const query = this.createQueryBuilder('trackingExtension')
            .leftJoinAndSelect('trackingExtension.latestData', 'latestData')
            .where('trackingExtension.deviceId = :trackingDeviceId', { trackingDeviceId })
            .orderBy('latestData.lastTrackedAt', 'DESC');

        return await this.gridUtilsService.applySearchFilters(
            this,
            query,
            filter,
            this.mapTrackingExtensionToDto.bind(this)
        );
    }

    private mapTrackingExtensionToDto(entity: TrackingExtensionOrmEntity): TrackingExtensionGridResponseDto {
        return {
            id: entity.id,
            extensionId: entity.extensionId,
            caption: entity.caption,
            description: entity.description,
            status: entity.status,
            updateAt: entity.updateAt,
            lastTrackedAt: entity.latestData && entity.latestData.length > 0 ? entity.latestData[0]?.lastTrackedAt : null,
            lastConnectedAt: entity.latestData && entity.latestData.length > 0 ? entity.latestData[0]?.lastConnectedAt : null,
        };
    }

    async updateStatus(trackingExtension: TrackingExtension): Promise<boolean> {
        const result = await this.update(
            { extensionId: trackingExtension.getExtensionId() },
            {
                status: trackingExtension.getStatus(),
                updateAt: trackingExtension.getUpdatedAt()
            }
        );
        return result.affected > 0;
    }

    async getTrackingExtensionByExtensionId(extensionId: string): Promise<TrackingExtension | null> {
        const trackingExtension = await this.findOne({ where: { extensionId: extensionId } });
        return trackingExtension ? this.mapToDomain(trackingExtension) : null;
    }

    private mapToDomain(entity: TrackingExtensionOrmEntity): TrackingExtension {
        return TrackingExtension.mapToDomain({
            id: entity.id,
            extensionId: entity.extensionId,
            caption: entity.caption,
            description: entity.description,
            status: entity.status,
            updatedAt: entity.updateAt,
            deviceId: entity.deviceId,
        });
    }
}