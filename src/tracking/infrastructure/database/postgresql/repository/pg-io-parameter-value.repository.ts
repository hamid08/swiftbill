import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { IoParameterValueOrmEntity } from '../entities';
import { IoParameterValue, IoParameterValueRepository } from 'src/tracking/domain';
import chunk from 'lodash/chunk'; // Utility for splitting arrays into chunks

@Injectable()
export class PgIoParameterValueRepo extends Repository<IoParameterValueOrmEntity> implements IoParameterValueRepository {
    constructor(private dataSource: DataSource) {
        super(IoParameterValueOrmEntity, dataSource.createEntityManager());
    }

    async getAllIoParameterValues(): Promise<IoParameterValue[]> {
        const OrmEntities = await this.find();

        // Map ORM entities to domain entities
        return OrmEntities.map((entity) => this.mapToDomain(entity)) || [];
    }

    private mapToDomain(ormEntity: IoParameterValueOrmEntity): IoParameterValue {
        return IoParameterValue.mapToDomain({
            id: ormEntity.id,
            valueKey: ormEntity.valueKey,
            caption: ormEntity.caption,
            name: ormEntity.name,
            ioParameterId: ormEntity.ioParameterId,
        });
    }

    async upsertIoParameterValues(brands: IoParameterValue[], batchSize: number = 2000): Promise<void> {
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
     * Upsert a batch of IoParameterValues using TypeORM's query builder.
     */
    private async upsertBatch(brands: IoParameterValue[]): Promise<void> {
        const ormEntities = brands.map((brand) => this.mapToOrmEntity(brand));

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(IoParameterValueOrmEntity)
            .values(ormEntities)
            .orUpdate(
                ['name', 'caption', 'io_parameter_id'], // Columns to update on conflict
                ['value_key', 'io_parameter_id']       // Columns to check for conflicts
            )
            .execute();
    }

    private mapToOrmEntity(brand: IoParameterValue): IoParameterValueOrmEntity {
        const ioParameterValueOrmEntity = new IoParameterValueOrmEntity();
        ioParameterValueOrmEntity.valueKey = brand.getValueKey();
        ioParameterValueOrmEntity.caption = brand.getCaption();
        ioParameterValueOrmEntity.name = brand.getName();
        ioParameterValueOrmEntity.ioParameterId = brand.getIoParameterId();
        return ioParameterValueOrmEntity;
    }
}