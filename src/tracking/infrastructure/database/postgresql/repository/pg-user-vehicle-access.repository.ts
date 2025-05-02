import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {  UserVehicleAccessRepository } from 'src/tracking/domain';
import { UserVehicleAccessOrmEntity } from '../entities';

@Injectable()
export class PgUserVehicleAccessRepo extends Repository<UserVehicleAccessOrmEntity> implements UserVehicleAccessRepository {
    constructor(
        private dataSource: DataSource,
    ) {
        super(UserVehicleAccessOrmEntity, dataSource.createEntityManager());
    }

    async assignVehicleToUser(userId: number, vehicleIds: number[]): Promise<void> {
        await this.insert(vehicleIds.map(vehicleId => ({ userId, vehicleId })));
    }

    async unassignVehicleFromUser(userId: number, vehicleIds: number[]): Promise<void> {
        await this.createQueryBuilder()
            .delete()
            .where('userId = :userId AND vehicleId IN (:...vehicleIds)', { userId, vehicleIds })
            .execute();
    }
}