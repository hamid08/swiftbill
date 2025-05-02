import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TripAreaOrmEntity } from '../entities';
import { TripArea, TripAreaRepository } from 'src/tracking/domain';

@Injectable()
export class PgTripAreaRepo extends Repository<TripAreaOrmEntity> implements TripAreaRepository {
    constructor(private dataSource: DataSource) {
        super(TripAreaOrmEntity, dataSource.createEntityManager());
    }

    /**
     * Creates a new trip area in the database.
     * @param tripArea - The trip area to create.
     */
    async createTripArea(tripArea: TripArea): Promise<void> {
        const tripAreaEntity = this.mapToOrmEntity(tripArea);
        await this.save(tripAreaEntity);
    }

    /**
     * Retrieves all trip areas for a given trip ID.
     * @param tripId - The ID of the trip.
     * @returns An array of trip areas.
     */
    async getTripAreasByTripId(tripId: number): Promise<TripArea[]> {
        const tripAreas = await this.find({
            where: {
                tripId
            }
        });

        return tripAreas.map(area => this.mapToDomain(area));
    }

    //#region Mapping Methods

    /**
     * Maps a domain entity to an ORM entity.
     * @param tripArea - The domain entity to map.
     * @returns The ORM entity.
     */
    private mapToOrmEntity(tripArea: TripArea): TripAreaOrmEntity {
        const entity = new TripAreaOrmEntity();
        entity.caption = tripArea.getCaption();
        entity.type = tripArea.getType();
        entity.geoContent = tripArea.getGeoContent();
        entity.tripId = tripArea.getTripId();
        return entity;
    }

    /**
     * Maps an ORM entity to a domain entity.
     * @param ormEntity - The ORM entity to map.
     * @returns The domain entity.
     */
    private mapToDomain(ormEntity: TripAreaOrmEntity): TripArea {
        return TripArea.mapToDomain(
            ormEntity.id,
            ormEntity.tripId,
            ormEntity.caption || '',
            ormEntity.type,
            ormEntity.geoContent
        );
    }

    //#endregion
}