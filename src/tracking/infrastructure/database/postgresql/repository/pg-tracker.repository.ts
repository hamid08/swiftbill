import { Injectable } from '@nestjs/common';
import { DataSource, In, IsNull, LessThan, LessThanOrEqual, MoreThan, Or, Repository, SelectQueryBuilder } from 'typeorm';
import { TrackerAssignmentOrmEntity, TrackerOrmEntity, TrackerLatestDataOrmEntity, TrackingModelOrmEntity } from '../entities';
import {
    BatteryChargeStatus,
    DeviceExtensionStatus,
    Tracker,
    TrackerAssignmentDetailsDto,
    TrackerCategoryViewMode,
    TrackerConnectionStatusDto,
    TrackerGridResponseDto,
    TrackerMinimalLatestDataResponseDto,
    TrackerRepository,
    TrackerStatusFilter,
    TrackerTelematicsDto,
    TrackerVehicleInfoDto,
    TrackingExtensionStatus,
    TrackerSummaryStatusDto,
    TrackerAssignmentListItemDto,
    TrackerLatestLocationDto,
    GetVehicleTrackingInfoResponseDto,
    NearbyTrackerResponseDto,
    UserAccessibleDto,
    DeviceBrandingNameDomainUtils
} from 'src/tracking/domain';
import { BaseGridViewDto, GeoUtils, GridConfig, GridUtilsService, GridViewDto, IO_PARAMETER_CONSTANT } from 'src/common';
import { GetNearbyVehicleRequestDto } from 'src/tracking/application';

@Injectable()
export class PgTrackerRepo extends Repository<TrackerOrmEntity> implements TrackerRepository {
    constructor(
        private dataSource: DataSource,
        private gridUtilsService: GridUtilsService,
    ) {
        super(TrackerOrmEntity, dataSource.createEntityManager());
    }


    //#region Vehicle Tracking Info

    async getVehicleTrackingInfo(vehicleIds: string[]): Promise<GetVehicleTrackingInfoResponseDto[]> {
        const query = this.createQueryBuilder('tracker')
            .leftJoinAndSelect('tracker.vehicle', 'vehicle')
            .where('vehicle.externalId IN (:...vehicleIds)', { vehicleIds });

        const results = await query.getMany();

        return results.map(result => ({
            vehicleId: result.vehicle?.externalId,
            lat: result.location ? GeoUtils.pointToLatLng(result.location).latitude : null,
            lng: result.location ? GeoUtils.pointToLatLng(result.location).longitude : null,
            angle: result.angle,
            altitude: result.altitude,
            speed: result.speed,
            lastConnectedAt: result.lastConnectedAt,
            lastTrackedAt: result.lastTrackedAt,
        }));
    }

    //#endregion


    //#region Nearby Trackers

    async findNearbyTrackers(
        dto: GetNearbyVehicleRequestDto,
        minToDetectIsOnline: number
    ): Promise<NearbyTrackerResponseDto> {
        const cutoff = new Date(Date.now() - minToDetectIsOnline * 60 * 1000);
        const centerPoint = GeoUtils.latLngToPoint(dto.lat, dto.lng);
        const pointWKT = `POINT(${centerPoint.coordinates[0]} ${centerPoint.coordinates[1]})`;

        const page = dto.page || 1;
        let limit = dto.limit || 50;
        if (limit > 1000) {
            limit = 1000;
        }
        const offset = (page - 1) * limit;

        // Main query for results
        const query = this.createQueryBuilder('tracker')
            .leftJoinAndSelect('tracker.vehicle', 'vehicle')
            .leftJoinAndSelect('tracker.business', 'business')
            .select([
                'tracker.lastConnectedAt',
                'tracker.lastTrackedAt',
                'tracker.altitude',
                'tracker.angle',
                'tracker.speed',
                'tracker.location',
                'vehicle.externalId',
                `ST_Distance(
              tracker.location::geography,
              ST_GeomFromText(:point, 4326)::geography
            ) as distance`
            ])
            .where(
                `tracker.lastTrackedAt > :cutoff AND
            ST_DWithin(
              tracker.location::geography,
              ST_GeomFromText(:point, 4326)::geography,
              :maxDistance
            )`,
                {
                    point: pointWKT,
                    maxDistance: dto.maxDistance || 1000,
                    cutoff
                }
            )
            .orderBy('distance', 'ASC')
            .skip(offset)
            .take(limit);

        // Count query for pagination
        const countQuery = this.createQueryBuilder('tracker')
            .leftJoin('tracker.vehicle', 'vehicle')
            .leftJoin('tracker.business', 'business')
            .where(
                `tracker.lastTrackedAt > :cutoff AND
            ST_DWithin(
              tracker.location::geography,
              ST_GeomFromText(:point, 4326)::geography,
              :maxDistance
            )`,
                {
                    point: pointWKT,
                    maxDistance: dto.maxDistance || 1000,
                    cutoff
                }
            );

        // Apply common filters to both queries
        const applyFilters = (q: SelectQueryBuilder<TrackerOrmEntity>) => {
            if (dto.businessId) {
                q.andWhere('business.externalId = :businessId', { businessId: dto.businessId });
            }
            if (dto.vehicleIds?.length) {
                q.andWhere('vehicle.externalId IN (:...vehicleIds)', { vehicleIds: dto.vehicleIds });
            }
            if (dto.vehicleUserTypeId) {
                q.andWhere('vehicle.userTypeId = :vehicleUserTypeId', { vehicleUserTypeId: dto.vehicleUserTypeId });
            }
            if (dto.vehicleModelIds?.length) {
                q.andWhere('vehicle.vehicleModelId IN (:...vehicleModelIds)', { vehicleModelIds: dto.vehicleModelIds });
            }
            return q;
        };

        // Execute both queries in parallel
        const [results, total] = await Promise.all([
            applyFilters(query).getRawMany(),
            applyFilters(countQuery).getCount()
        ]);

        return {
            locations: results.map(result => ({
                lastConnectedAt: result.tracker_last_connected_at,
                lastTrackedAt: result.tracker_last_tracked_at,
                vehicleId: result.vehicle_external_id,
                altitude: result.tracker_altitude,
                angle: result.tracker_angle,
                speed: result.tracker_speed,
                distance: result.distance,
                lat: GeoUtils.pointToLatLng(result.tracker_location).latitude,
                lng: GeoUtils.pointToLatLng(result.tracker_location).longitude,
            })),
            pagination: {
                page,
                limit,
                total
            }
        };
    }

    //#endregion


    //#region Tracker Latest Location

    /**
     * Gets the latest location for all trackers in a business
     * @param businessId - The business ID to get tracker locations for
     * @param minToDetectIsOnline - Minutes threshold to determine if a tracker is online
     * @returns An array of tracker latest locations
     */
    async getTrackersLatestLocation(userAccessibles: UserAccessibleDto, businessExternalId: string, minToDetectIsOnline: number): Promise<TrackerLatestLocationDto[]> {
        try {
            // Calculate the cutoff time for online status
            const cutoff = minToDetectIsOnline > 0
                ? new Date(Date.now() - minToDetectIsOnline * 60 * 1000) : null;

            // Build an optimized query to get only the necessary data
            const query = this.createQueryBuilder('tracker')
                .innerJoin('tracker.business', 'business', 'business.externalId = :businessExternalId', { businessExternalId })
                .leftJoin('tracker.vehicle', 'vehicle')
                .where('tracker.lastConnectedAt IS NOT NULL')
                .andWhere('tracker.location IS NOT NULL');

            // Apply user access filters
            this.applyUserAccessiblesFilter(query, userAccessibles);

            // Add online status filter if needed
            if (cutoff) {
                query.andWhere('tracker.lastConnectedAt > :cutoff', { cutoff });
            }

            const results = await query
                .select([
                    'tracker.id',
                    'tracker.lastConnectedAt',
                    'tracker.lastTrackedAt',
                    'tracker.altitude',
                    'tracker.angle',
                    'tracker.speed',
                    'ST_X(tracker.location::geometry) AS longitude',
                    'ST_Y(tracker.location::geometry) AS latitude'
                ])
                .getRawMany();

            return results.map(tracker => {
                try {
                    return {
                        trackerId: tracker.tracker_id,
                        altitude: tracker.tracker_altitude || 0,
                        angle: tracker.tracker_angle || 0,
                        speed: tracker.tracker_speed || 0,
                        lng: parseFloat(tracker.longitude),
                        lat: parseFloat(tracker.latitude),
                        date: tracker.tracker_last_connected_at || tracker.tracker_last_connected_at,
                    };

                } catch (error) {
                    return null;
                }
            }).filter(Boolean) as TrackerLatestLocationDto[];
        } catch (error) {
            console.error('Error getting trackers latest location:', error);
            return [];
        }
    }

    //#endregion

    //#region Tracker Assignment List

    async getAssignmentList(trackerId: number, categoryViewMode: TrackerCategoryViewMode): Promise<TrackerAssignmentListItemDto[]> {
        const query = await this.createQueryBuilder('tracker')
            .leftJoinAndSelect('tracker.trackerAssignments', 'trackerAssignments')
            .leftJoinAndSelect('trackerAssignments.trackingDevice', 'trackingDevice')
            .leftJoinAndSelect('trackingDevice.model', 'model')
            .leftJoinAndSelect('model.brand', 'brand')
            .leftJoinAndSelect('tracker.trips', 'trips', 'trips.endDate IS NULL')
            .where('tracker.id = :trackerId', { trackerId });

        if (categoryViewMode === TrackerCategoryViewMode.CURRENT) {
            query.andWhere('trackerAssignments.endDate IS NULL')
                .orderBy('trackerAssignments.id', 'DESC');
        } else {
            query.andWhere('trackerAssignments.endDate IS NOT NULL')
                .orderBy('trackerAssignments.id', 'DESC');
        }

        const tracker = await query.getOne();

        if (!tracker || !tracker.trackerAssignments?.length) {
            return [];
        }

        return tracker.trackerAssignments.map(assignment =>
            this.mapToAssignmentListItemDto(tracker, assignment)
        );
    }

    private mapToAssignmentListItemDto(
        tracker: TrackerOrmEntity,
        assignment: TrackerAssignmentOrmEntity
    ): TrackerAssignmentListItemDto {
        return {
            assignmentId: assignment.id,
            brandingName: this.createBrandingName(assignment.trackingDevice.model),
            isDefault: assignment.isDefault,
            hasCurrentTrip: tracker.trips?.length > 0 || false,
        };
    }

    private createBrandingName(trackingModelOrm: TrackingModelOrmEntity): string {
        return DeviceBrandingNameDomainUtils.getBrandingNameFromProperties(
            trackingModelOrm.caption,
            trackingModelOrm.name,
            trackingModelOrm.brand?.caption,
            trackingModelOrm.brand?.name,
        );
    }

    //#endregion


    //#region Tracker Summary Status

    /**
     * Gets a summary of tracker statuses for a business
     * @param businessId - The business ID to get tracker statuses for
     * @param minToDetectIsOnline - Minutes threshold to determine if a tracker is online
     * @returns A summary of tracker statuses
     */
    async getTrackerSummaryStatus(userAccessibles: UserAccessibleDto, businessExternalId: string, minToDetectIsOnline: number): Promise<TrackerSummaryStatusDto> {
        const cutoff = new Date(Date.now() - minToDetectIsOnline * 60 * 1000);

        // Get base filtered tracker IDs
        const trackerIds = await this.getFilteredTrackerIds(userAccessibles, businessExternalId);

        if (trackerIds.length === 0) {
            return this.createEmptySummary();
        }

        if (trackerIds.length === 0) {
            return {
                totalCount: 0,
                poweredOnCount: 0,
                poweredOffCount: 0,
                onlineCount: 0,
                offlineCount: 0,
                movingCount: 0,
                stoppedCount: 0,
                violationsCount: 0,
                lastUpdated: new Date()
            };
        }

        // Execute all counts in parallel
        const [
            poweredOnCount,
            poweredOffCount,
            onlineCount,
            movingCount,
            violationsCount
        ] = await Promise.all([
            this.getPoweredTrackerCount(trackerIds, true,),
            this.getPoweredTrackerCount(trackerIds, false),
            this.getOnlineTrackerCount(trackerIds, cutoff),
            this.getMovingTrackerCount(trackerIds, cutoff),
            this.getViolationTrackerCount(trackerIds)
        ]);

        // Calculate derived counts
        const offlineCount = trackerIds.length - onlineCount;
        const stoppedCount = onlineCount - movingCount;

        return {
            totalCount: trackerIds.length,
            poweredOnCount,
            poweredOffCount,
            onlineCount,
            offlineCount,
            movingCount,
            stoppedCount,
            violationsCount,
            lastUpdated: new Date()
        };
    }

    private async getFilteredTrackerIds(
        userAccessibles: UserAccessibleDto,
        businessExternalId: string
    ): Promise<number[]> {
        const query = this.createQueryBuilder('tracker')
            .select('tracker.id')
            .leftJoin('tracker.business', 'business')
            .leftJoin('tracker.vehicle', 'vehicle')
            .where('business.externalId = :businessExternalId', { businessExternalId });

        this.applyUserAccessiblesFilter(query, userAccessibles);

        const results = await query.getMany();
        return results.map(t => t.id);
    }

    private createEmptySummary(): TrackerSummaryStatusDto {
        return {
            totalCount: 0,
            poweredOnCount: 0,
            poweredOffCount: 0,
            onlineCount: 0,
            offlineCount: 0,
            movingCount: 0,
            stoppedCount: 0,
            violationsCount: 0,
            lastUpdated: new Date()
        };
    }

    private async getPoweredTrackerCount(
        trackerIds: number[],
        isPoweredOn: boolean,
    ): Promise<number> {
        const value = isPoweredOn ? '1' : '0';
        return this.createQueryBuilder('tracker')
            .leftJoin('tracker.trackerAssignments', 'trackerAssignments')
            .leftJoin('trackerAssignments.latestData', 'latestData')
            .leftJoin('latestData.parameters', 'parameters')
            .leftJoin('parameters.ioParameter', 'ioParameter')
            .where('tracker.id IN (:...trackerIds)', { trackerIds })
            .andWhere('trackerAssignments.isDefault = true')
            .andWhere('trackerAssignments.endDate IS NULL')
            .andWhere('latestData.extensionId IS NULL')
            .andWhere('ioParameter.parameterKey = :ignitionKey', {
                ignitionKey: IO_PARAMETER_CONSTANT.STATIC_NAME.IGNITION
            })
            .andWhere('parameters.ioParameterValue = :value', { value })
            .getCount();
    }

    private async getOnlineTrackerCount(
        trackerIds: number[],
        cutoff: Date
    ): Promise<number> {
        return this.count({
            where: {
                id: In(trackerIds),
                lastConnectedAt: MoreThan(cutoff)
            }
        });
    }

    private async getMovingTrackerCount(
        trackerIds: number[],
        cutoff: Date
    ): Promise<number> {
        return this.createQueryBuilder('tracker')
            .leftJoin('tracker.trackerAssignments', 'trackerAssignments')
            .leftJoin('trackerAssignments.latestData', 'latestData')
            .where('tracker.id IN (:...trackerIds)', { trackerIds })
            .andWhere('trackerAssignments.isDefault = true')
            .andWhere('trackerAssignments.endDate IS NULL')
            .andWhere('latestData.extensionId IS NULL')
            .andWhere('tracker.lastConnectedAt > :cutoff', { cutoff })
            .andWhere('latestData.speed > 5') // Threshold for moving (5 km/h)
            .getCount();
    }

    private async getViolationTrackerCount(
        trackerIds: number[]
    ): Promise<number> {
        return this.createQueryBuilder('tracker')
            .leftJoin('tracker.trackerAssignments', 'trackerAssignments')
            .leftJoin('trackerAssignments.violations', 'violations')
            .where('tracker.id IN (:...trackerIds)', { trackerIds })
            .andWhere('trackerAssignments.isDefault = true')
            .andWhere('trackerAssignments.endDate IS NULL')
            .andWhere('violations.id IS NOT NULL')
            .getCount();
    }

    //#endregion

    //#region Tracker Grid

    async getGrid(
        userAccessibles: UserAccessibleDto,
        businessExternalId: string,
        filter: BaseGridViewDto,
        categoryViewMode: TrackerCategoryViewMode,
        statusFilter: TrackerStatusFilter,
        preVehicleAvatarUrl: string,
        minToDetectIsOnline: number,
        trackerId?: number,
    ): Promise<GridViewDto<TrackerGridResponseDto>> {
        const cutoff = new Date(Date.now() - minToDetectIsOnline * 60 * 1000);
        const mapper = this.createGridMapper(preVehicleAvatarUrl, categoryViewMode, cutoff);

        const baseResults = await this.executeBaseGridQuery(
            userAccessibles,
            businessExternalId,
            categoryViewMode,
            statusFilter,
            cutoff,
            filter,
            mapper
        );

        if (trackerId) {
            await this.ensureTrackerInResults(
                trackerId,
                userAccessibles,
                businessExternalId,
                categoryViewMode,
                statusFilter,
                cutoff,
                baseResults,
                mapper,
                filter.pageSize
            );
        }

        return baseResults;
    }


    private getGridConfig(): GridConfig {
        return {
            searchableFields: [
                { name: 'vehicle.identity', searchType: 'contains', priority: 3 },
                { name: 'vehicle.plaqueNo', searchType: 'contains', priority: 1 },
                { name: 'vehicle.vehicleModelName', searchType: 'contains', priority: 1 },
                { name: 'trackingDevice.imei', searchType: 'contains', priority: 1 },
                { name: 'trackingDevice.serialNumber', searchType: 'contains', priority: 1 },
                { name: 'trackingDevice.simNumber', searchType: 'contains', priority: 1 },
                { name: 'trackerAssignments.terminalNumber', searchType: 'contains', priority: 1 },
            ],
            sortableFields: [
                { fieldPath: 'tracker.id', defaultDirection: 'DESC' },
                { fieldPath: 'vehicle.identity', defaultDirection: 'ASC' },
                { fieldPath: 'vehicle.plaqueNo' },
                { fieldPath: 'vehicle.vehicleModelName' },
                { fieldPath: 'trackingDevice.imei' },
                { fieldPath: 'trackingDevice.serialNumber' },
                { fieldPath: 'trackingDevice.simNumber' },
                { fieldPath: 'trackerAssignments.terminalNumber' },
            ],
        };
    }

    private buildBaseGridQuery(
        userAccessibles: UserAccessibleDto,
        businessExternalId: string,
        categoryViewMode: TrackerCategoryViewMode,
        statusFilter: TrackerStatusFilter,
        cutoff: Date
    ): SelectQueryBuilder<TrackerOrmEntity> {
        const query = this.createQueryBuilder('tracker')
            .leftJoinAndSelect('tracker.vehicle', 'vehicle')
            .leftJoinAndSelect('tracker.business', 'business')
            .leftJoinAndSelect('tracker.trackerAssignments', 'trackerAssignments')
            .leftJoinAndSelect('trackerAssignments.events', 'events')
            .leftJoinAndSelect('trackerAssignments.violations', 'violations')
            .leftJoinAndSelect('trackerAssignments.latestData', 'latestData')
            .leftJoinAndSelect('latestData.parameters', 'parameters')
            .leftJoinAndSelect('parameters.ioParameter', 'ioParameter')
            .leftJoinAndSelect('trackerAssignments.trackingDevice', 'trackingDevice')
            .leftJoinAndSelect('trackingDevice.extensions', 'extensions')
            .where('business.externalId = :businessExternalId', { businessExternalId });

        this.applyUserAccessiblesFilter(query, userAccessibles);

        this.applyCategoryFilters(query, categoryViewMode);

        if (categoryViewMode === TrackerCategoryViewMode.CURRENT && statusFilter && statusFilter !== TrackerStatusFilter.ALL) {
            this.applyStatusFilter(query, statusFilter, cutoff);
        }

        return query;
    }

    private applyUserAccessiblesFilter(query: SelectQueryBuilder<TrackerOrmEntity>, userAccessibles: UserAccessibleDto) {
        if (!userAccessibles.accessToAllVehicles && userAccessibles.accessibleVehicles.length > 0) {
            query.andWhere('vehicle.id IN (:...vehicleIds)', { vehicleIds: userAccessibles.accessibleVehicles });
        }
    }

    private applyCategoryFilters(
        query: SelectQueryBuilder<TrackerOrmEntity>,
        categoryViewMode: TrackerCategoryViewMode
    ) {
        if (categoryViewMode === TrackerCategoryViewMode.CURRENT) {
            query.andWhere('trackerAssignments.endDate IS NULL')
                .orderBy({
                    'tracker.lastConnectedAt': {
                        order: 'DESC',
                        nulls: 'NULLS LAST'
                    },
                    'tracker.id': 'DESC'
                });
        } else {
            query.andWhere('trackerAssignments.endDate IS NOT NULL')
                .orderBy('trackerAssignments.endDate', 'DESC')
                .addOrderBy('tracker.id', 'DESC');
        }
    }

    private applyStatusFilter(
        query: SelectQueryBuilder<TrackerOrmEntity>,
        statusFilter: TrackerStatusFilter,
        cutoff: Date
    ) {
        const filterStrategies: Record<TrackerStatusFilter, () => void> = {
            [TrackerStatusFilter.POWERED_ON]: () => this.applyIgnitionFilter(query, '1'),
            [TrackerStatusFilter.POWERED_OFF]: () => this.applyIgnitionFilter(query, '0'),
            [TrackerStatusFilter.ONLINE]: () => query.andWhere('tracker.lastConnectedAt > :cutoff', { cutoff }),
            [TrackerStatusFilter.OFFLINE]: () => query.andWhere('tracker.lastConnectedAt <= :cutoff OR tracker.lastConnectedAt IS NULL', { cutoff }),
            [TrackerStatusFilter.MOVING]: () => this.applyMovementFilter(query, cutoff, true),
            [TrackerStatusFilter.STOPPED]: () => this.applyMovementFilter(query, cutoff, false),
            [TrackerStatusFilter.HAS_VIOLATIONS]: () => this.applyViolationFilter(query),
            [TrackerStatusFilter.ALL]: () => { } // No filter applied
        };

        filterStrategies[statusFilter]();
    }

    private applyIgnitionFilter(
        query: SelectQueryBuilder<TrackerOrmEntity>,
        value: string
    ) {
        query.andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('1')
                .from(TrackerAssignmentOrmEntity, 'ta')
                .innerJoin('ta.latestData', 'ld')
                .innerJoin('ld.parameters', 'p')
                .innerJoin('p.ioParameter', 'io')
                .where('ta.trackerId = tracker.id')
                .andWhere('ta.isDefault = true')
                .andWhere('ta.endDate IS NULL')
                .andWhere('ld.extensionId IS NULL')
                .andWhere('io.parameterKey = :ignitionKey', {
                    ignitionKey: IO_PARAMETER_CONSTANT.STATIC_NAME.IGNITION
                })
                .andWhere('p.ioParameterValue = :value', { value })
                .getQuery();
            return `EXISTS ${subQuery}`;
        });
    }


    private applyMovementFilter(
        query: SelectQueryBuilder<TrackerOrmEntity>,
        cutoff: Date,
        isMoving: boolean
    ) {
        const speedCondition = isMoving ? 'ld.speed > 5' : 'ld.speed <= 5';

        query.andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('1')
                .from(TrackerAssignmentOrmEntity, 'ta')
                .innerJoin('ta.latestData', 'ld')
                .where('ta.trackerId = tracker.id')
                .andWhere('ta.isDefault = true')
                .andWhere('ta.endDate IS NULL')
                .andWhere('ld.extensionId IS NULL')
                .andWhere('tracker.lastConnectedAt > :cutoff', { cutoff })
                .andWhere(speedCondition)
                .getQuery();
            return `EXISTS ${subQuery}`;
        });
    }


    private applyViolationFilter(query: SelectQueryBuilder<TrackerOrmEntity>) {
        query.andWhere(qb => {
            const subQuery = qb.subQuery()
                .select('1')
                .from(TrackerAssignmentOrmEntity, 'ta')
                .innerJoin('ta.violations', 'v')
                .where('ta.trackerId = tracker.id')
                .andWhere('ta.isDefault = true')
                .andWhere('ta.endDate IS NULL')
                .getQuery();
            return `EXISTS ${subQuery}`;
        });
    }

    private async executeBaseGridQuery(
        userAccessibles: UserAccessibleDto,
        businessExternalId: string,
        categoryViewMode: TrackerCategoryViewMode,
        statusFilter: TrackerStatusFilter,
        cutoff: Date,
        filter: BaseGridViewDto,
        mapper: (entity: TrackerOrmEntity) => TrackerGridResponseDto
    ): Promise<GridViewDto<TrackerGridResponseDto>> {
        const query = this.buildBaseGridQuery(userAccessibles, businessExternalId, categoryViewMode, statusFilter, cutoff);
        return this.gridUtilsService.applySearchFilters(this, query, filter, mapper, this.getGridConfig());
    }

    private async ensureTrackerInResults(
        trackerId: number,
        userAccessibles: UserAccessibleDto,
        businessExternalId: string,
        categoryViewMode: TrackerCategoryViewMode,
        statusFilter: TrackerStatusFilter,
        cutoff: Date,
        baseResults: GridViewDto<TrackerGridResponseDto>,
        mapper: (entity: TrackerOrmEntity) => TrackerGridResponseDto,
        pageSize: number
    ): Promise<void> {
        const existingTracker = baseResults.list.find(t => t.id === trackerId);
        if (existingTracker) {
            baseResults.list = baseResults.list.filter(t => t.id !== trackerId);
            this.insertTrackerInResults(existingTracker, baseResults, pageSize);
            return;
        }

        const tracker = await this.findTrackerForGrid(
            userAccessibles,
            trackerId,
            businessExternalId,
            categoryViewMode,
            statusFilter,
            cutoff,
            mapper
        );

        if (tracker) {
            this.insertTrackerInResults(tracker, baseResults, pageSize);
        }
    }

    private async findTrackerForGrid(
        userAccessibles: UserAccessibleDto,
        trackerId: number,
        businessExternalId: string,
        categoryViewMode: TrackerCategoryViewMode,
        statusFilter: TrackerStatusFilter,
        cutoff: Date,
        mapper: (entity: TrackerOrmEntity) => TrackerGridResponseDto
    ): Promise<TrackerGridResponseDto | undefined> {
        const query = this.buildBaseGridQuery(userAccessibles, businessExternalId, categoryViewMode, statusFilter, cutoff)
            .andWhere('tracker.id = :trackerId', { trackerId });

        const result = await this.gridUtilsService.applySearchFilters(
            this, query, { pageIndex: 1, pageSize: 1 }, mapper
        );

        return result.list[0];
    }

    private insertTrackerInResults(
        tracker: TrackerGridResponseDto,
        results: GridViewDto<TrackerGridResponseDto>,
        pageSize: number
    ) {
        results.list.unshift(tracker);
        if (results.list.length > pageSize) {
            results.list.pop();
        }
    }

    private createGridMapper(
        preVehicleAvatarUrl: string,
        categoryViewMode: TrackerCategoryViewMode,
        cutoff: Date
    ) {
        return (entity: TrackerOrmEntity) => this.mapToGridDto(
            entity,
            preVehicleAvatarUrl,
            categoryViewMode,
            cutoff
        );
    }

    private getDefaultAssignment(ormEntity: TrackerOrmEntity): TrackerAssignmentOrmEntity | null {
        return ormEntity.trackerAssignments.find(assignment => assignment.isDefault) || null;
    }

    private getExtensionStatus(assignment: TrackerAssignmentOrmEntity): DeviceExtensionStatus {
        const extensions = assignment.trackingDevice.extensions || [];
        const activeExtension = extensions.find(extension => extension.status === TrackingExtensionStatus.Active);
        return activeExtension ? DeviceExtensionStatus.ACTIVE_EXTENSION : DeviceExtensionStatus.INACTIVE_EXTENSION;
    }

    private getTodayDateRange(): { start: Date; end: Date } {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        return { start, end };
    }

    private mapToGridDto(
        ormEntity: TrackerOrmEntity,
        preVehicleAvatarUrl: string,
        categoryViewMode: TrackerCategoryViewMode,
        cutoff: Date
    ): TrackerGridResponseDto {
        if (categoryViewMode === TrackerCategoryViewMode.ARCHIVE) {
            const firstAssignment = ormEntity.trackerAssignments[0];
            return {
                id: ormEntity.id,
                type: ormEntity.type,
                vehicle: ormEntity.vehicle ? this.mapToVehicleDto(ormEntity, preVehicleAvatarUrl) : null,
                assignment: {
                    assignmentStart: firstAssignment?.startDate,
                    assignmentEnd: firstAssignment?.endDate,
                }
            };
        }

        const todayRange = this.getTodayDateRange();
        const defaultAssignment = this.getDefaultAssignment(ormEntity);
        const latestData = defaultAssignment?.latestData.find(c => !c.extensionId) || null;
        const connection = this.mapToConnectionDto(ormEntity, cutoff);

        return {
            id: ormEntity.id,
            type: ormEntity.type,
            vehicle: this.mapToVehicleDto(ormEntity, preVehicleAvatarUrl),
            connection: connection,
            assignment: defaultAssignment
                ? this.mapToAssignmentDto(defaultAssignment, todayRange)
                : null,
            telematics: defaultAssignment ? this.mapToTelematicsDto(connection.isOnline, latestData) : null,
        };
    }

    private mapToVehicleDto(
        ormEntity: TrackerOrmEntity,
        preVehicleAvatarUrl: string
    ): TrackerVehicleInfoDto | null {
        if (!ormEntity.vehicle) return null;

        return {
            id: ormEntity.vehicle.id,
            name: ormEntity.vehicle.vehicleModelName,
            avatar: ormEntity.vehicle.image
                ? `${preVehicleAvatarUrl}${ormEntity.vehicle.image}`
                : null,
            identity: ormEntity.vehicle.identity,
            plaqueNo: ormEntity.vehicle.plaqueNo,
            plaqueType: ormEntity.vehicle.plaqueType,
            plaqueStatus: ormEntity.vehicle.plaqueStatus,
            companyName: ormEntity.vehicle.companyName,
        };
    }

    private mapToConnectionDto(
        ormEntity: TrackerOrmEntity,
        cutoff: Date
    ): TrackerConnectionStatusDto {
        return {
            isOnline: ormEntity.lastConnectedAt ? ormEntity.lastConnectedAt > cutoff : false,
            lastConnectedAt: ormEntity.lastConnectedAt,
        };
    }

    private mapToAssignmentDto(
        assignment: TrackerAssignmentOrmEntity,
        todayRange: { start: Date; end: Date }
    ): TrackerAssignmentDetailsDto {
        return {
            unreadEvents: assignment.events.filter(event => !event.isSeen).length,
            todaysViolations: assignment.violations.filter(violation =>
                violation.startDate >= todayRange.start &&
                violation.startDate <= todayRange.end
            ).length,
            extensionStatus: this.getExtensionStatus(assignment),
            assignmentStart: assignment.startDate,
            assignmentEnd: assignment.endDate,
        };
    }

    private mapToTelematicsDto(
        isOnline: boolean,
        latestData?: TrackerLatestDataOrmEntity,
    ): TrackerTelematicsDto | null {
        if (!latestData) return null;

        const parameters = latestData.parameters || [];
        const onTheWay = isOnline && latestData.speed > 5;

        const batteryLevel = parameters.find(c => c.ioParameter.name === IO_PARAMETER_CONSTANT.STATIC_NAME.BATTERY_LEVEL)?.ioParameterValue ?? '0';
        const batteryChargeStatus = parameters.find(c => c.ioParameter.name === IO_PARAMETER_CONSTANT.STATIC_NAME.BATTERY_CHARGE_STATUS)?.ioParameterValue ?? '0';
        const ignition = parameters.find(c => c.ioParameter.name === IO_PARAMETER_CONSTANT.STATIC_NAME.IGNITION)?.ioParameterValue ?? '0';

        return {
            onTheWay,
            batteryLevel: parseInt(batteryLevel),
            batteryChargeStatus: parseInt(batteryChargeStatus) === 1 ? BatteryChargeStatus.CHARGING : BatteryChargeStatus.DISCHARGING,
            isEngineOn: parseInt(ignition) === 1,
        };
    }

    //#endregion



    //#region Other Methods

    async getByVehicleId(vehicleId: number): Promise<Tracker | null> {
        const tracker = await this.findOne({
            where: { vehicleId },
        });

        return tracker ? this.mapToDomain(tracker) : null;
    }

    async getLatestTracingDataByImei(imei: string): Promise<TrackerMinimalLatestDataResponseDto | null> {
        const tracker = await this.findOne({
            where: {
                trackerAssignments: { trackingDevice: { imei }, isDefault: true, endDate: IsNull() },
            },

        });

        return tracker ? {
            lastTrackedAt: tracker.lastTrackedAt,
            lastConnectedAt: tracker.lastConnectedAt,
            location: tracker.location,
        } : null;
    }

    async getByTrackerId(trackerId: number): Promise<Tracker | null> {
        const tracker = await this.findOne({
            where: { id: trackerId },
        });

        return tracker ? this.mapToDomain(tracker) : null;
    }

    /**
     * Creates a new tracker in the database.
     * @param tracker - The tracker domain entity to create.
     */
    async createTracker(tracker: Tracker): Promise<Tracker> {
        const trackerOrm = this.mapToOrm(tracker);
        await this.save(trackerOrm);
        return this.mapToDomain(trackerOrm);
    }

    /**
     * Updates the location and tracking timestamps of a tracker.
     * @param imei - The IMEI of the tracking device.
     * @param tracker - The tracker domain entity with updated location information.
     */
    async updateLocation(imei: string, tracker: Tracker): Promise<void> {
        const existingTracker = await this.findTrackerByImeiAndCondition(imei, tracker.getLastTrackedAt());

        if (existingTracker) {
            await this.updateTracker(existingTracker.id, {
                location: tracker.getLocation(),
                lastTrackedAt: tracker.getLastTrackedAt(),
                lastConnectedAt: tracker.getLastConnectedAt(),
            });
        } else {
            await this.updateLastConnectedByImei(imei, tracker.getLastConnectedAt());
        }
    }

    /**
     * Finds a tracker by IMEI and lastTrackedAt condition.
     * @param imei - The IMEI of the tracking device.
     * @param lastTrackedAt - The last tracked timestamp to compare.
     * @returns The found tracker or null.
     */
    private async findTrackerByImeiAndCondition(imei: string, lastTrackedAt: Date): Promise<TrackerOrmEntity | null> {
        return this.findOne({
            where: {
                trackerAssignments: { trackingDevice: { imei }, isDefault: true },
                lastTrackedAt: Or(IsNull(), LessThan(lastTrackedAt)),
            },
        });
    }

    /**
     * Updates a tracker by ID with the provided fields.
     * @param id - The ID of the tracker to update.
     * @param fields - The fields to update.
     */
    private async updateTracker(id: number, fields: Partial<TrackerOrmEntity>): Promise<void> {
        await this.update({ id }, fields);
    }

    /**
     * Updates the lastConnectedAt field for a tracker by IMEI.
     * @param imei - The IMEI of the tracking device.
     * @param lastConnectedAt - The new last connected timestamp.
     */
    private async updateLastConnectedByImei(imei: string, lastConnectedAt: Date): Promise<void> {
        const existingTracker = await this.findOne({
            where: {
                trackerAssignments: { trackingDevice: { imei }, isDefault: true },
            },
        });

        if (existingTracker) {
            await this.update(existingTracker.id, { lastConnectedAt });
        }
    }

    /**
     * Maps a domain entity to an ORM entity.
     * @param tracker - The tracker domain entity to map.
     * @returns The corresponding ORM entity.
     */
    private mapToOrm(tracker: Tracker): TrackerOrmEntity {
        const trackerOrm = new TrackerOrmEntity();

        if (tracker.getId()) {
            trackerOrm.id = tracker.getId();
        }

        trackerOrm.type = tracker.getType();
        trackerOrm.businessId = tracker.getBusinessId();
        trackerOrm.vehicleId = tracker.getVehicleId();

        return trackerOrm;
    }

    /**
     * Maps an ORM entity to a domain entity.
     * @param trackerOrm - The tracker ORM entity to map.
     * @returns The corresponding domain entity.
     */
    private mapToDomain(trackerOrm: TrackerOrmEntity): Tracker {
        return Tracker.mapToDomain({
            id: trackerOrm.id,
            type: trackerOrm.type,
            businessId: trackerOrm.businessId,
            vehicleId: trackerOrm.vehicleId,
            lastTrackedAt: trackerOrm.lastTrackedAt,
            lastConnectedAt: trackerOrm.lastConnectedAt,
            location: trackerOrm.location,
        });
    }
    //#endregion
}