import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { User, UserAccessibleDto, UserGridResponseDto, UserRepository } from 'src/tracking/domain';
import { UserOrmEntity } from '../entities';
import chunk from 'lodash/chunk';
import { BaseGridViewDto, GridConfig, GridUtilsService, GridViewDto } from 'src/common';

@Injectable()
export class PgUserRepo extends Repository<UserOrmEntity> implements UserRepository {
    constructor(
        private dataSource: DataSource,
        private gridUtilsService: GridUtilsService,
    ) {
        super(UserOrmEntity, dataSource.createEntityManager());
    }


    async getUserAccessibles(userExternalId: string): Promise<UserAccessibleDto> {
        const user = await this.findOne({ where: { externalId: userExternalId }, relations: ['accessibleVehicles'] });
        return user ? {
            accessToAllVehicles: user.accessToAllVehicles,
            accessibleVehicles: user.accessibleVehicles.map((userVehicle) => userVehicle.vehicleId),
        } : null;
    }

    async updateVehicleAccess(userId: number, accessToAllVehicles: boolean): Promise<void> {
        await this.update(userId, { accessToAllVehicles });
    }

    private getGridConfig(): GridConfig {
        return {
            searchableFields: [
                { name: 'users.displayName', searchType: 'contains', priority: 3 },
                { name: 'users.username', searchType: 'exact', priority: 2 },
            ],
            sortableFields: [
                { fieldPath: 'users.id', defaultDirection: 'DESC' },
                { fieldPath: 'users.displayName', defaultDirection: 'ASC' },
                { fieldPath: 'users.username' },
            ],
            defaultSort: 'users.id DESC'
        };
    }

    async grid(filter: BaseGridViewDto, businessExternalId: string): Promise<GridViewDto<UserGridResponseDto>> {
        const queryBuilder = this.createQueryBuilder('users');
        
        queryBuilder.where(`
            EXISTS (
                SELECT 1 
                FROM unnest(string_to_array(users.businessExternalIds, ',')) AS id
                WHERE id = :businessExternalId
            )
        `, { businessExternalId });
    
        return await this.gridUtilsService.applySearchFilters(this, queryBuilder, filter, this.mapUserToDto, this.getGridConfig());
    }

    private mapUserToDto(entity: UserOrmEntity): UserGridResponseDto {
        return {
            id: entity.id,
            accessToAllVehicles: entity.accessToAllVehicles,
            fullName: entity.displayName,
            userName: entity.username,
            updateAt: entity.updatedAt,
        };
    }

    async getByUserId(userId: number): Promise<User | null> {
        const userOrmEntity = await this.findOne({ where: { id: userId } });
        return userOrmEntity ? this.mapToDomain(userOrmEntity) : null;
    }

    async findByExternalId(externalId: string): Promise<User | null> {
        const userOrmEntity = await this.findOne({ where: { externalId } });
        return userOrmEntity ? this.mapToDomain(userOrmEntity) : null;
    }

    async saveUser(user: User): Promise<User> {
        const userOrmEntity = this.mapToOrmEntity(user);
        const savedEntity = await this.save(userOrmEntity);
        return this.mapToDomain(savedEntity);
    }

    async findAll(): Promise<User[]> {
        const userOrmEntities = await this.find();
        return userOrmEntities.map((entity) => this.mapToDomain(entity));
    }

    async upsertUser(user: User): Promise<User> {
        const existingUser = await this.findByExternalId(user.getExternalId());

        if (existingUser) {
            // Update existing user
            existingUser.setDisplayName(user.getDisplayName());
            existingUser.setUsername(user.getUsername());
            existingUser.setUpdatedAt(user.getUpdatedAt());
            existingUser.setAccessToAllVehicles(user.getAccessToAllVehicles());
            return this.saveUser(existingUser);
        } else {
            // Create new user
            return this.saveUser(user);
        }
    }

    /**
     * Upsert users in bulk using TypeORM's query builder for better performance.
     * This method uses batch processing and conflict resolution to handle large datasets efficiently.
     */
    async upsertUsers(users: User[], batchSize: number = 2000): Promise<void> {
        const batches = chunk(users, batchSize);

        for (const batch of batches) {
            try {
                await this.upsertBatch(batch);
            } catch (error) {
                console.error('Error upserting batch:', error);
            }
        }
    }

    /**
     * Upsert a batch of users using TypeORM's query builder.
     */
    private async upsertBatch(users: User[]): Promise<void> {
        const ormEntities = users.map((user) => this.mapToOrmEntity(user));

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(UserOrmEntity)
            .values(ormEntities)
            .orUpdate(
                [
                    'display_name',
                    'username',
                    'updated_at',
                    'business_external_ids',
                ],
                ['external_id'], // Conflict target
            )
            .execute();
    }

    private mapToOrmEntity(user: User): UserOrmEntity {
        const userOrmEntity = new UserOrmEntity();
        userOrmEntity.id = user.getId();
        userOrmEntity.externalId = user.getExternalId();
        userOrmEntity.displayName = user.getDisplayName();
        userOrmEntity.username = user.getUsername();
        userOrmEntity.updatedAt = user.getUpdatedAt();
        userOrmEntity.accessToAllVehicles = user.getAccessToAllVehicles();
        userOrmEntity.businessExternalIds = user.getBusinessExternalIds();
        return userOrmEntity;
    }

    private mapToDomain(userOrmEntity: UserOrmEntity): User {
        return User.mapToDomain({
            id: userOrmEntity.id,
            externalId: userOrmEntity.externalId,
            displayName: userOrmEntity.displayName,
            username: userOrmEntity.username,
            updatedAt: userOrmEntity.updatedAt,
            accessToAllVehicles: userOrmEntity.accessToAllVehicles,
        });
    }
}