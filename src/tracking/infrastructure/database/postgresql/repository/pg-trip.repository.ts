import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TripAreaOrmEntity, TripOrmEntity } from '../entities';
import { CurrentTripInfoDto, Trip, TripArea, TripGridResponseDto, TripRepository, TripRouteResponseDto } from 'src/tracking/domain';
import { GridViewDto, GridUtilsService } from 'src/common';
import { BaseGridViewDto } from 'src/common';

@Injectable()
export class PgTripRepo extends Repository<TripOrmEntity> implements TripRepository {
    constructor(
        private dataSource: DataSource,
        private gridUtils: GridUtilsService,
    ) {
        super(TripOrmEntity, dataSource.createEntityManager());
    }

    //#region  Grid
    async getGrid(
        filter: BaseGridViewDto,
        trackerId: number,
        fromDate?: Date,
        toDate?: Date
    ): Promise<GridViewDto<TripGridResponseDto>> {
        const query = this.buildGridQuery(trackerId, fromDate, toDate);
        return this.gridUtils.applySearchFilters(
            this,
            query,
            filter,
            this.toGridItemDto.bind(this)
        );
    }

    private buildGridQuery(trackerId: number, fromDate?: Date, toDate?: Date) {
        // const whereConditions: any = {};

        // if (fromDate) {
        //     whereConditions.startDate = MoreThanOrEqual(fromDate);
        // }
        // if (toDate) {
        //     whereConditions.endDate = LessThanOrEqual(toDate);
        // }

        // return this.createQueryBuilder('trip')
        //     .where('trip.trackerId = :trackerId', { trackerId })
        //     .andWhere(whereConditions);

        const query = this.createQueryBuilder('trip')
            .where('trip.trackerId = :trackerId', { trackerId });

        if (fromDate) {
            query.andWhere('trip.startDate >= :fromDate', { fromDate });
        }
        if (toDate) {
            query.andWhere('(trip.endDate <= :toDate OR trip.endDate IS NULL)', { toDate });
        }

        return query;
    }

    private toGridItemDto(ormEntity: TripOrmEntity): TripGridResponseDto {
        return {
            id: ormEntity.id,
            tripNumber: ormEntity.tripNumber,
            tripName: ormEntity.caption,
            duration: ormEntity.duration,
            driverName: ormEntity.driverName,
            tripType: ormEntity.creationService,
            startTrip: ormEntity.startDate,
            endTrip: ormEntity.endDate,
            violationCount: 0,
        };
    }

    //#endregion

    //#region  Trip Route By Id
    /**
     * Finds a trip by its ID and returns it as a DTO.
     * @param tripId - The ID of the trip.
     * @returns TripRouteResponseDto if found, otherwise null.
     */
    async findTripRouteById(tripId: number): Promise<TripRouteResponseDto | null> {
        const trip = await this.findOne({
            where: { id: tripId },
            relations: ['areas'],
        });
        return trip ? this.mapToTripRouteResponseDto(trip) : null;
    }
    //#endregion

    //#region  Trip By Id

    async getTripById(tripId: number): Promise<Trip | null> {
        const trip = await this.findOne({
            where: {
                id: tripId
            },
        });
        return trip ? this.mapToDomain(trip) : null;
    }

    //#endregion

    //#region  Current Trip By Id

    async getCurrentTrip(trackerId: number): Promise<Trip | null> {
        const trip = await this.findOne({
            where: {
                trackerId,
                endDate: IsNull(),
            },
        });
        return trip ? this.mapToDomain(trip) : null;
    }

    //#endregion

    //#region  Current Trip Route

    /**
     * Finds the default (latest active) trip for a tracker.
     * @param trackerId - The ID of the tracker.
     * @returns TripRouteResponseDto if found, otherwise null.
     */
    async findCurrentTripRoute(trackerId: number): Promise<TripRouteResponseDto | null> {
        const trip = await this.findOne({
            where: {
                trackerId,
                endDate: IsNull(),
            },
            relations: ['areas'],
            order: { startDate: 'DESC' },
        });
        return trip ? this.mapToTripRouteResponseDto(trip) : null;
    }

    //#endregion

    //#region  Current Trip Info
    async findCurrentTripInfo(trackerId: number): Promise<CurrentTripInfoDto | null> {
        const trip = await this.findOne({
            where: {
                trackerId,
                endDate: IsNull(),
            },
        });

        return trip ? {
            driverName: trip.driverName,
            duration: trip.duration,
            startTrip: trip.startDate,
            endTrip: trip.endDate,
            tripName: trip.caption,
            tripNumber: trip.tripNumber,
            tripType: trip.creationService,
            violationCount: 0, //Note: Set To Handler
        } : null;
    }
    //#endregion

    //#region  Create Trip
    /**
     * Creates a new trip in the database.
     * @param trip - The domain Trip object to persist.
     * @returns The ID of the newly created trip.
     */
    async createTrip(trip: Trip): Promise<number> {
        const tripEntity = this.mapToOrmEntity(trip);
        await this.save(tripEntity);
        return tripEntity.id;
    }

    //#endregion

    //#region Deactive All Trip

    /**
     * Marks all active trips for a tracker as inactive (sets endDate).
     * @param trackerId - The ID of the tracker.
     */
    async deactivateAllTrips(trackerId: number): Promise<void> {
        await this.createQueryBuilder()
            .update(TripOrmEntity)
            .set({ endDate: new Date() })
            .where('trackerId = :trackerId', { trackerId })
            .andWhere('endDate IS NULL')
            .execute();
    }

    //#endregion

    //#region  All Active Trips
    /**
     * Retrieves all active trips for a tracker.
     * @param trackerId - The ID of the tracker.
     * @returns List of domain Trip objects.
    */
    async findAllActiveTrips(trackerId: number): Promise<Trip[]> {
        const trips = await this.find({
            where: {
                trackerId,
                endDate: IsNull(),
            },
            relations: ['areas'],
            order: { startDate: 'DESC' },
        });
        return trips.map(this.mapToDomain.bind(this));
    }

    //#endregion


    //#region Private Mappers

    /**
     * Maps a TripOrmEntity to a TripRouteResponseDto.
     */
    private mapToTripRouteResponseDto(trip: TripOrmEntity): TripRouteResponseDto {
        return {
            caption: trip.caption,
            maximumGeofenceBreach: trip.maxGeofenceBreaches,
            coordinates: trip.path.coordinates,
            allowedAreas: trip.areas.map((area) => ({
                caption: area.caption,
                type: area.type,
                geoContent: area.geoContent,
            })),
        };
    }

    /**
     * Maps a TripOrmEntity to a domain Trip.
     */
    private mapToDomain(ormEntity: TripOrmEntity): Trip {
        return Trip.mapToDomain({
            id: ormEntity.id,
            caption: ormEntity.caption || '',
            maxGeofenceBreaches: ormEntity.maxGeofenceBreaches,
            creationService: ormEntity.creationService,
            startDate: ormEntity.startDate,
            path: ormEntity.path,
            trackerId: ormEntity.trackerId,
            endDate: ormEntity.endDate,
            tripNumber: ormEntity.tripNumber,
            driverName: ormEntity.driverName,
            duration: ormEntity.duration,
            areas: ormEntity.areas?.map(this.mapAreaToDomain.bind(this)) || [],
        });
    }

    /**
     * Maps a domain Trip to a TripOrmEntity.
     */
    private mapToOrmEntity(trip: Trip): TripOrmEntity {
        const entity = new TripOrmEntity();
        entity.caption = trip.getCaption();
        entity.maxGeofenceBreaches = trip.getMaxGeofenceBreaches();
        entity.creationService = trip.getCreationService();
        entity.startDate = trip.getStartDate();
        entity.path = trip.getPath();
        entity.trackerId = trip.getTrackerId();
        entity.endDate = trip.getEndDate();
        entity.tripNumber = trip.getTripNumber();
        entity.driverName = trip.getDriverName();
        entity.duration = trip.getDuration();
        return entity;
    }

    /**
     * Maps a TripAreaOrmEntity to a domain TripArea.
     */
    private mapAreaToDomain(ormEntity: TripAreaOrmEntity): TripArea {
        return TripArea.mapToDomain(
            ormEntity.id,
            ormEntity.tripId,
            ormEntity.caption || '',
            ormEntity.type,
            ormEntity.geoContent,
        );
    }

    //#endregion

}