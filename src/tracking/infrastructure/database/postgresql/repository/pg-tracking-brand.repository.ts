import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TrackingBrandOrmEntity } from '../entities';
import { TrackingBrand, TrackingBrandRepository } from 'src/tracking/domain';
import chunk from 'lodash/chunk'; // Utility for splitting arrays into chunks
import { SelectItemDto } from 'src/common';



@Injectable()
export class PgTrackingBrandRepo extends Repository<TrackingBrandOrmEntity> implements TrackingBrandRepository {
    constructor(private dataSource: DataSource) {
        super(TrackingBrandOrmEntity, dataSource.createEntityManager());
    }

   async getTrackingBrandById(trackingBrandId: number): Promise<TrackingBrand | null> {
        const trackingBrand = await this.findOne({ where: { id: trackingBrandId } });
        return trackingBrand ? this.mapToDomain(trackingBrand) : null;
    }

    async getList(): Promise<SelectItemDto[]> {
        const entities = await this.find();
        
        return entities?.map(entity => new SelectItemDto(
            entity.id,
            entity.caption || entity.name
        )) ?? [];
    }



    async getAllTrackingBrands(): Promise<TrackingBrand[]> {
        const OrmEntities = await this.find();

        // Map ORM entities to domain entities
        return OrmEntities.map((entity) => this.mapToDomain(entity)) || [];
    }

    private mapToDomain(ormEntity: TrackingBrandOrmEntity): TrackingBrand {
        return TrackingBrand.mapToDomain({
            id: ormEntity.id,
            externalId: ormEntity.externalId,
            caption: ormEntity.caption,
            isMobile: ormEntity.isMobile,
            name: ormEntity.name
        });
    }


    async upsertTrackingBrands(brands: TrackingBrand[], batchSize: number = 2000): Promise<void> {
        const batches = chunk(brands, batchSize);

        for (const batch of batches) {
            try {
                await this.upsertBatch(batch);
            } catch (error) {
                console.error('Error upserting batch:', error);
            }
        }
    }

    /**
  * Upsert a batch of trackingBrands using TypeORM's query builder.
  */
    private async upsertBatch(brands: TrackingBrand[]): Promise<void> {
        const ormEntities = brands.map((brand) => this.mapToOrmEntity(brand));

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(TrackingBrandOrmEntity)
            .values(ormEntities)
            .orUpdate(['name', 'caption', 'is_mobile'], ['external_id']) // Update these columns on conflict
            .execute();
    }

    private mapToOrmEntity(brand: TrackingBrand): TrackingBrandOrmEntity {
        const trackingBrandOrmEntity = new TrackingBrandOrmEntity();
        trackingBrandOrmEntity.externalId = brand.getExternalId();
        trackingBrandOrmEntity.caption = brand.getCaption();
        trackingBrandOrmEntity.isMobile = brand.getIsMobile();
        trackingBrandOrmEntity.name = brand.getName();
        return trackingBrandOrmEntity;
    }



}