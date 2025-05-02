import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Vehicle, VehicleAssignmentMobileGridResponseDto, VehicleRepository, VehiclesUserGridResponseDto } from 'src/tracking/domain';
import { VehicleOrmEntity } from '../entities';
import chunk from 'lodash/chunk';
import { BaseGridViewDto, GridUtilsService, GridViewDto, SelectItemDto, SelectItemFilter } from 'src/common';

@Injectable()
export class PgVehicleRepo extends Repository<VehicleOrmEntity> implements VehicleRepository {
    constructor(private dataSource: DataSource, private gridUtilsService: GridUtilsService) {
        super(VehicleOrmEntity, dataSource.createEntityManager());
    }


    async getVehicleByTrackerId(trackerId: number): Promise<Vehicle | null> {
        const vehicleOrmEntity = await this.findOne({ where: { trackerId } });
        return vehicleOrmEntity ? this.mapToDomain(vehicleOrmEntity) : null;
    }

    async existVehicleByExternalId(externalId: string): Promise<boolean> {
        const query = this.createQueryBuilder('vehicle')
            .where('vehicle.external_id = :externalId', { externalId });
        return await query.getExists();
    }

    async existVehicleByIdentity(identity: string): Promise<boolean> {
        const query = this.createQueryBuilder('vehicle')
            .where('vehicle.identity = :identity', { identity });
        return await query.getExists();
    }

    async getVehicleByIdentity(identity: string): Promise<Vehicle | null> {
        const ormEntity = await this.createQueryBuilder('vehicle')
            .where('vehicle.identity = :identity', { identity }).getOne();
        return ormEntity ? this.mapToDomain(ormEntity) : null;
    }


    async createVehicle(vehicle: Vehicle): Promise<number> {
        const ormEntity = this.mapToOrmEntity(vehicle);
        return (await this.save(ormEntity)).id;


    }

    async getVehicleByPlaqueNo(plaqueNo: string): Promise<Vehicle | null> {
        const vehicleOrmEntity = await this.findOne({ where: { plaqueNo: plaqueNo } });
        return vehicleOrmEntity ? this.mapToDomain(vehicleOrmEntity) : null;
    }


    async getVehicleById(vehicleId: number): Promise<Vehicle | null> {
        const vehicleOrmEntity = await this.findOne({ where: { id: vehicleId } });
        return vehicleOrmEntity ? this.mapToDomain(vehicleOrmEntity) : null;
    }

    async getList(filter: SelectItemFilter, businessExternalId: string): Promise<SelectItemDto[]> {
        const { searchTerm } = filter;
        const queryBuilder = this.createQueryBuilder('vehicle')
            .leftJoin('vehicle.business', 'business')
            .where('business.external_id = :businessExternalId', { businessExternalId });

        if (searchTerm?.trim()) {
            const term = `%${searchTerm.trim()}%`;
            queryBuilder.andWhere(
                '(LOWER(vehicle.plaqueNo) LIKE LOWER(:term) OR ' +
                'LOWER(vehicle.identity) LIKE LOWER(:term))',
                { term }
            );
        }

        queryBuilder.orderBy('vehicle.id', 'DESC');

        const entities = await queryBuilder.getMany();

        return entities.map(entity => new SelectItemDto(
            entity.id,
            `${entity.plaqueNo || ''} (${entity.identity})`
        ));
    }


    async updateTrackerId(vehicleId: number, trackerId: number): Promise<void> {
        await this.update(vehicleId, { trackerId });
    }

    async getVehiclesByIds(vehicleIds: number[]): Promise<Vehicle[]> {
        const vehicles = await this.find({ where: { id: In(vehicleIds) } });
        return vehicles.map((vehicle) => this.mapToDomain(vehicle)) || [];
    }


    async getVehiclesByExternalIds(externalIds: string[]): Promise<Vehicle[]> {
        const vehicles = await this.find({ where: { externalId: In(externalIds) } });
        return vehicles.map((vehicle) => this.mapToDomain(vehicle)) || [];
    }

    async vehiclesMobileGrid(filter: BaseGridViewDto, businessExternalId: string, mobileModelId: number): Promise<GridViewDto<VehicleAssignmentMobileGridResponseDto>> {
        const queryBuilder = this
            .createQueryBuilder('vehicle')
            .leftJoinAndSelect('vehicle.tracker', 'tracker')
            .leftJoin('vehicle.business', 'business')
            .leftJoinAndSelect('tracker.trackerAssignments', 'assignment')
            .leftJoinAndSelect('assignment.trackingDevice', 'device')
            .where('business.external_id = :businessExternalId', { businessExternalId })
            .andWhere('vehicle.imei IS NOT NULL')
            .andWhere(
                `NOT EXISTS (
            SELECT 1 FROM tracker_assignments ta
            JOIN tracking_devices td ON ta.tracking_device_id = td.id
            WHERE ta.tracker_id = tracker.id
            AND td.model_id = :mobileModelId
            AND ta.end_date IS NULL
          )`,
                { mobileModelId }
            )

        return await this.gridUtilsService.applySearchFilters(this, queryBuilder, filter, this.mapVehiclesMobileToDto);
    }

    private mapVehiclesMobileToDto(entity: VehicleOrmEntity): VehicleAssignmentMobileGridResponseDto {
        return {
            id: entity.id,
            identity: entity.identity,
            plaqueStatus: entity.plaqueStatus,
            plaqueType: entity.plaqueType,
            plaqueNo: entity.plaqueNo,
            imei: entity.imei,
        };
    }


    async unassignVehiclesGrid(filter: BaseGridViewDto, userId: number, businessExternalId: string): Promise<GridViewDto<VehiclesUserGridResponseDto>> {
        const queryBuilder = this
            .createQueryBuilder('vehicles')
            .leftJoin('vehicles.business', 'business')
            .where('business.external_id = :businessExternalId', { businessExternalId })
            .leftJoin('vehicles.authorizedUsers', 'authorizedUsers')
            .leftJoin('authorizedUsers.user', 'user')
            .andWhere('user.id IS NULL OR user.id <> :userId', { userId })
            .orderBy('vehicles.id', 'ASC');

        return await this.gridUtilsService.applySearchFilters(this, queryBuilder, filter, this.mapVehiclesUserToDto);
    }

    async assignVehiclesGrid(filter: BaseGridViewDto, userId: number, businessExternalId: string): Promise<GridViewDto<VehiclesUserGridResponseDto>> {
        const queryBuilder = this
            .createQueryBuilder('vehicles')
            .leftJoin('vehicles.business', 'business')
            .where('business.external_id = :businessExternalId', { businessExternalId })
            .leftJoin('vehicles.authorizedUsers', 'authorizedUsers')
            .leftJoin('authorizedUsers.user', 'user')
            .andWhere('user.id = :userId', { userId })
            .orderBy('vehicles.id', 'ASC');

        return await this.gridUtilsService.applySearchFilters(this, queryBuilder, filter, this.mapVehiclesUserToDto);
    }

    private mapVehiclesUserToDto(entity: VehicleOrmEntity): VehiclesUserGridResponseDto {
        return {
            id: entity.id,
            identity: entity.identity,
            plaqueStatus: entity.plaqueStatus,
            plaqueType: entity.plaqueType,
            plaqueNo: entity.plaqueNo,
        };
    }


    async findById(id: number): Promise<Vehicle | null> {
        const vehicleOrmEntity = await this.findOne({ where: { id } });
        return vehicleOrmEntity ? this.mapToDomain(vehicleOrmEntity) : null;
    }

    async findByExternalId(externalId: string): Promise<Vehicle | null> {
        const vehicleOrmEntity = await this.findOne({ where: { externalId } });
        return vehicleOrmEntity ? this.mapToDomain(vehicleOrmEntity) : null;
    }

    async saveVehicle(vehicle: Vehicle): Promise<Vehicle> {
        const vehicleOrmEntity = this.mapToOrmEntity(vehicle);
        const savedEntity = await this.save(vehicleOrmEntity);
        return this.mapToDomain(savedEntity);
    }

    async findAll(): Promise<Vehicle[]> {
        const vehicleOrmEntities = await this.find();
        return vehicleOrmEntities.map((entity) => this.mapToDomain(entity));
    }

    async upsertVehicle(vehicle: Vehicle): Promise<Vehicle> {
        const existingVehicle = await this.findByExternalId(vehicle.getExternalId());

        if (existingVehicle) {
            // Update existing vehicle
            existingVehicle.setName(vehicle.getName());
            existingVehicle.setIdentity(vehicle.getIdentity());
            existingVehicle.setPlaqueStatus(vehicle.getPlaqueStatus());
            existingVehicle.setPlaqueType(vehicle.getPlaqueType());
            existingVehicle.setPlaqueNo(vehicle.getPlaqueNo());
            existingVehicle.setVehicleModelName(vehicle.getVehicleModelName());
            existingVehicle.setVehicleModelId(vehicle.getVehicleModelId());
            existingVehicle.setUserTypeName(vehicle.getUserTypeName());
            existingVehicle.setUserTypeId(vehicle.getUserTypeId());
            existingVehicle.setCompanyName(vehicle.getCompanyName());
            existingVehicle.setImage(vehicle.getImage());
            existingVehicle.setImei(vehicle.getImei());
            existingVehicle.setBusinessId(vehicle.getBusinessId());
            existingVehicle.setTrackerId(vehicle.getTrackerId());
            return this.saveVehicle(existingVehicle);
        } else {
            // Create new vehicle
            return this.saveVehicle(vehicle);
        }
    }

    /**
     * Upsert vehicles in bulk using TypeORM's query builder for better performance.
     * This method uses batch processing and conflict resolution to handle large datasets efficiently.
     */
    async upsertVehicles(vehicles: Vehicle[], batchSize: number = 2000): Promise<void> {
        const batches = chunk(vehicles, batchSize);

        for (const batch of batches) {
            try {
                await this.upsertBatch(batch);
            } catch (error) {
                console.error('Error upserting batch:', error);
            }
        }
    }

    /**
     * Upsert a batch of vehicles using TypeORM's query builder.
     */
    private async upsertBatch(vehicles: Vehicle[]): Promise<void> {
        const ormEntities = vehicles.map((vehicle) => this.mapToOrmEntity(vehicle));

        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(VehicleOrmEntity)
            .values(ormEntities)
            .orUpdate(
                [
                    'name',
                    'identity',
                    'plaque_status',
                    'plaque_type',
                    'plaque_no',
                    'vehicle_model_name',
                    'vehicle_model_id',
                    'user_type_name',
                    'user_type_id',
                    'company_name',
                    'image',
                    'imei',
                    'business_id',
                ],
                ['external_id'], // Conflict target
            )
            .execute();
    }

    private mapToOrmEntity(vehicle: Vehicle): VehicleOrmEntity {
        const vehicleOrmEntity = new VehicleOrmEntity();
        vehicleOrmEntity.id = vehicle.getId();
        vehicleOrmEntity.externalId = vehicle.getExternalId();
        vehicleOrmEntity.name = vehicle.getName();
        vehicleOrmEntity.identity = vehicle.getIdentity();
        vehicleOrmEntity.plaqueStatus = vehicle.getPlaqueStatus();
        vehicleOrmEntity.plaqueType = vehicle.getPlaqueType();
        vehicleOrmEntity.plaqueNo = vehicle.getPlaqueNo();
        vehicleOrmEntity.vehicleModelName = vehicle.getVehicleModelName();
        vehicleOrmEntity.vehicleModelId = vehicle.getVehicleModelId();
        vehicleOrmEntity.userTypeName = vehicle.getUserTypeName();
        vehicleOrmEntity.userTypeId = vehicle.getUserTypeId();
        vehicleOrmEntity.companyName = vehicle.getCompanyName();
        vehicleOrmEntity.image = vehicle.getImage();
        vehicleOrmEntity.imei = vehicle.getImei();
        vehicleOrmEntity.businessId = vehicle.getBusinessId();
        vehicleOrmEntity.trackerId = vehicle.getTrackerId();
        return vehicleOrmEntity;
    }

    private mapToDomain(vehicleOrmEntity: VehicleOrmEntity): Vehicle {
        return Vehicle.mapToDomain({
            id: vehicleOrmEntity.id,
            externalId: vehicleOrmEntity.externalId,
            name: vehicleOrmEntity.name,
            identity: vehicleOrmEntity.identity,
            plaqueStatus: vehicleOrmEntity.plaqueStatus,
            plaqueType: vehicleOrmEntity.plaqueType,
            plaqueNo: vehicleOrmEntity.plaqueNo,
            vehicleModelName: vehicleOrmEntity.vehicleModelName,
            vehicleModelId: vehicleOrmEntity.vehicleModelId,
            userTypeName: vehicleOrmEntity.userTypeName,
            userTypeId: vehicleOrmEntity.userTypeId,
            companyName: vehicleOrmEntity.companyName,
            image: vehicleOrmEntity.image,
            imei: vehicleOrmEntity.imei,
            businessId: vehicleOrmEntity.businessId,
            trackerId: vehicleOrmEntity.trackerId,
        });
    }
}