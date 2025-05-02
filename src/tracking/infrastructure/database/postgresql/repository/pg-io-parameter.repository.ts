import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { IoParameterOrmEntity } from '../entities';
import { IoParameter, IoParameterRepository, IoElement } from 'src/tracking/domain';
import { chunk } from 'lodash';
import { SelectItemDto } from 'src/common';

@Injectable()
export class PgIoParameterRepo extends Repository<IoParameterOrmEntity> implements IoParameterRepository {
    constructor(private dataSource: DataSource) {
        super(IoParameterOrmEntity, dataSource.createEntityManager());
    }

    async getList(): Promise<SelectItemDto<string>[]> {
        const entities = await this.find();

        return entities.map(entity => new SelectItemDto(
            entity.parameterKey,
            entity.caption
        )) || [];
    }

    async getTransformedIoElements(ioElements: IoElement[]): Promise<IoElement[]> {
        const results = await Promise.all(
            ioElements.map(async (io) => {
                try {
                    const ormEntity = await this.findOne({
                        where: {
                            parameterKey: io.getKey(),
                            isEvent: false,
                            showInPanel: true
                        }
                    });

                    if (!ormEntity) {
                        return null;
                    }

                    const value = ormEntity.values.length > 0
                        ? ormEntity.values.find(v => v.valueKey === io.getValue())?.caption || io.getValue()
                        : io.getValue();

                    return IoElement.create(
                        ormEntity.parameterKey,
                        value
                    );
                } catch (error) {
                    console.error(`Error processing io element with key ${io.getKey()}:`, error);
                    return null;
                }
            })
        );

        return results.filter((result): result is IoElement => result !== null);
    }

    async getAllIoParameters(): Promise<IoParameter[]> {
        const OrmEntities = await this.find();

        // Map ORM entities to domain entities
        return OrmEntities.map((entity) => this.mapToDomain(entity)) || [];
    }

    async getIoParameterByExternalId(externalId: string): Promise<IoParameter | null> {
        const ormEntity = await this.findOne({ where: { externalId } });
        return ormEntity ? this.mapToDomain(ormEntity) : null;
    }

    async getIoParameterByKey(key: string): Promise<IoParameter | null> {
        const ormEntity = await this.findOne({ where: { parameterKey: key } });
        return ormEntity ? this.mapToDomain(ormEntity) : null;
    }

    async getIoParameterByName(name: string): Promise<IoParameter | null> {
        const ormEntity = await this.findOne({ where: { name: name } });
        return ormEntity ? this.mapToDomain(ormEntity) : null;
    }

    private mapToDomain(ormEntity: IoParameterOrmEntity): IoParameter {
        return IoParameter.mapToDomain({
            id: ormEntity.id,
            externalId: ormEntity.externalId,
            caption: ormEntity.caption,
            name: ormEntity.name,
            isEvent: ormEntity.isEvent,
            showInPanel: ormEntity.showInPanel,
            parameterKey: ormEntity.parameterKey,
            measurementUnit: ormEntity.measurementUnit,
            icon: ormEntity.icon,
            modelId: ormEntity.modelId,
        });
    }


    async upsertIoParameters(brands: IoParameter[], batchSize: number = 2000): Promise<void> {
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
  * Upsert a batch of IoParameters using TypeORM's query builder.
  */
    private async upsertBatch(brands: IoParameter[]): Promise<void> {
        const ormEntities = brands.map((brand) => this.mapToOrmEntity(brand));

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(IoParameterOrmEntity)
            .values(ormEntities)
            .orUpdate(['name', 'caption', 'parameter_key', 'measurement_unit', 'icon', 'is_event', 'show_in_panel', 'model_id'], ['external_id']) // Update these columns on conflict
            .execute();
    }

    private mapToOrmEntity(brand: IoParameter): IoParameterOrmEntity {
        const ioParameterOrmEntity = new IoParameterOrmEntity();
        ioParameterOrmEntity.externalId = brand.getExternalId();
        ioParameterOrmEntity.caption = brand.getCaption();
        ioParameterOrmEntity.parameterKey = brand.getParameterKey();
        ioParameterOrmEntity.measurementUnit = brand.getMeasurementUnit();
        ioParameterOrmEntity.icon = brand.getIcon();
        ioParameterOrmEntity.isEvent = brand.getIsEvent();
        ioParameterOrmEntity.showInPanel = brand.getShowInPanel();
        ioParameterOrmEntity.modelId = brand.getModelId();
        ioParameterOrmEntity.name = brand.getName();
        return ioParameterOrmEntity;
    }



}