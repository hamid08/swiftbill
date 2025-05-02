import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ViolationLocation, ViolationLocationRepository, ViolationLocationType } from 'src/tracking/domain';
import { ViolationLocationOrmEntity } from '../entities';

@Injectable()
export class PgViolationLocationRepo extends Repository<ViolationLocationOrmEntity> implements ViolationLocationRepository {
    constructor(private dataSource: DataSource
    ) {
        super(ViolationLocationOrmEntity, dataSource.createEntityManager());
    }

    async createViolationLocation(violationLocation: ViolationLocation): Promise<void> {
        const ormEntity = new ViolationLocationOrmEntity();
        ormEntity.location = violationLocation.getLocation();
        ormEntity.angle = violationLocation.getAngle();
        ormEntity.altitude = violationLocation.getAltitude();
        ormEntity.speed = violationLocation.getSpeed();
        ormEntity.occurredAt = violationLocation.getOccurredAt();
        ormEntity.locationType = violationLocation.getLocationType();
        ormEntity.violationId = violationLocation.getViolationId();

        await this.save(ormEntity);
    }

    
}