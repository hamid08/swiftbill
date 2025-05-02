import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TrackingModelOrmEntity } from '../entities';
import { TrackingBrand, TrackingDeviceSupportedCommandDto, TrackingModel, TrackingModelRepository } from 'src/tracking/domain';
import chunk from 'lodash/chunk'; // Utility for splitting arrays into chunks
import { SelectItemDto } from 'src/common';



@Injectable()
export class PgTrackingModelRepo extends Repository<TrackingModelOrmEntity> implements TrackingModelRepository {
    constructor(private dataSource: DataSource) {
        super(TrackingModelOrmEntity, dataSource.createEntityManager());
    }

    async getSupportedCommands(trackingModelId: number): Promise<TrackingDeviceSupportedCommandDto> {
        const trackingModel = await this.findOne({ where: { id: trackingModelId } });
        return trackingModel ? new TrackingDeviceSupportedCommandDto(TrackingModel.getSupportedCommands(trackingModel.supportedCommands)) :
            new TrackingDeviceSupportedCommandDto([]);
    }

    async getTrackingModelByExternalId(externalId: string): Promise<TrackingModel | null> {
        const trackingModel = await this.findOne({ where: { externalId: externalId }, relations: ['brand'] });
        return trackingModel ? this.mapToDomain(trackingModel) : null;
    }

    async getTrackingModelById(trackingModelId: number): Promise<TrackingModel | null> {
        const trackingModel = await this.findOne({ where: { id: trackingModelId }, relations: ['brand'] });
        return trackingModel ? this.mapToDomain(trackingModel) : null;
    }

    async getList(trackingBrandId: number): Promise<SelectItemDto[]> {
        const entities = await this.find({
            where: {
                brandId: trackingBrandId
            }
        });

        return entities?.map(entity => new SelectItemDto(
            entity.id,
            entity.caption || entity.name
        )) ?? [];
    }


    async getMobileModel(): Promise<TrackingModel | null> {
        const OrmEntity = await this.findOne({ where: { isMobile: true }, relations: ['brand'] });
        return OrmEntity ? this.mapToDomain(OrmEntity) : null;
    }


    async getMobileModelId(): Promise<number | null> {
        const OrmEntity = await this.findOne({ where: { isMobile: true } });
        return OrmEntity?.id || null;
    }

    async getAllTrackingModels(): Promise<TrackingModel[]> {
        const OrmEntities = await this.find();

        // Map ORM entities to domain entities
        return OrmEntities.map((entity) => this.mapToDomain(entity)) || [];
    }

    private mapToDomain(ormEntity: TrackingModelOrmEntity): TrackingModel {
        return TrackingModel.mapToDomain({
            id: ormEntity.id,
            externalId: ormEntity.externalId,
            caption: ormEntity.caption,
            isMobile: ormEntity.isMobile,
            name: ormEntity.name,
            brandId: ormEntity.brandId,
            supportedCommands: TrackingModel.getSupportedCommands(ormEntity.supportedCommands),
            isSupportedExtension: ormEntity.isSupportedExtension,
            brand: ormEntity.brand ? TrackingBrand.mapToDomain({
                id: ormEntity.brand.id,
                name: ormEntity.brand.name,
                externalId: ormEntity.brand.externalId,
                caption: ormEntity.brand.caption,
                isMobile: ormEntity.brand.isMobile,
            }) : null
        });
    }

    async upsertTrackingModels(Models: TrackingModel[], batchSize: number = 2000): Promise<void> {
        const batches = chunk(Models, batchSize);

        for (const batch of batches) {
            try {
                await this.upsertBatch(batch);
            } catch (error) {
                console.error('Error upserting batch:', error);
            }
        }
    }

    /**
  * Upsert a batch of trackingModels using TypeORM's query builder.
  */
    private async upsertBatch(Models: TrackingModel[]): Promise<void> {
        const ormEntities = Models.map((Model) => this.mapToOrmEntity(Model));

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(TrackingModelOrmEntity)
            .values(ormEntities)
            .orUpdate(['name', 'caption', 'is_mobile', 'brand_id', 'supported_commands', 'is_supported_extension'], ['external_id']) // Update these columns on conflict
            .execute();
    }

    private mapToOrmEntity(Model: TrackingModel): TrackingModelOrmEntity {
        const trackingModelOrmEntity = new TrackingModelOrmEntity();
        trackingModelOrmEntity.externalId = Model.getExternalId();
        trackingModelOrmEntity.caption = Model.getCaption();
        trackingModelOrmEntity.isMobile = Model.getIsMobile();
        trackingModelOrmEntity.isSupportedExtension = Model.getIsSupportedExtension();
        trackingModelOrmEntity.name = Model.getName();
        trackingModelOrmEntity.brandId = Model.getBrandId();
        trackingModelOrmEntity.supportedCommands = TrackingModel.getSupportedCommandsString(Model.getSupportedCommands());
        return trackingModelOrmEntity;
    }



}