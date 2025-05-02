import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In, IsNull, Not, Repository } from 'typeorm';
import {
    ActiveStatus, DeviceBrandingNameDomainUtils, MinimalLocationB1, MinimalLocationB3, MinimalVehicleInfo, TrackerAssignment,
    TrackerAssignmentDevicesRegisterationDto,
    TrackerAssignmentGridResponseDto,
    TrackerAssignmentInfoDto,
    TrackerAssignmentRepository,
    TrackerAssignmentStatusConnection,
    TrackerAssignmentStatusDto,
    TrackerAssignmentStatusIoParameters,
    TrackerAssignmentUpdateInfo,
} from 'src/tracking/domain';
import { TrackerAssignmentOrmEntity, TrackingBrandOrmEntity, TrackingModelOrmEntity, TrackerLatestDataOrmEntity, TrackerDataParameterOrmEntity, TrackerOrmEntity, VehicleOrmEntity } from '../entities';
import { BaseGridViewDto, GridUtilsService, GridViewDto, GeoUtils, GridConfig } from 'src/common';

@Injectable()
export class PgTrackerAssignmentRepo extends Repository<TrackerAssignmentOrmEntity> implements TrackerAssignmentRepository {
    constructor(
        private dataSource: DataSource,
        private gridUtilsService: GridUtilsService,
    ) {
        super(TrackerAssignmentOrmEntity, dataSource.createEntityManager());
    }

    //#region  Get Default Assignment Tracking Data With Terminal Number
    async getDefaultAssignmentTrackingDataWithTerminalNumber(terminalNumber: string): Promise<MinimalLocationB3 | null> {
        const trackerAssignment = await this.findOne({
            where: { terminalNumber, isDefault: true },
            relations: ['latestData', 'tracker']
        });

        return trackerAssignment ? {
            assignmentId: trackerAssignment.id,
            lat: GeoUtils.pointToLatLng(trackerAssignment.latestData[0].location).latitude,
            lng: GeoUtils.pointToLatLng(trackerAssignment.latestData[0].location).longitude,
            speed: trackerAssignment.latestData[0].speed,
            angle: trackerAssignment.latestData[0].angle,
            altitude: trackerAssignment.latestData[0].altitude,
            lastConnectedAt: trackerAssignment.tracker.lastConnectedAt,
            lastTrackedAt: trackerAssignment.tracker.lastTrackedAt,
        } : null;
    }
    //#endregion                

    //#region  Get Status
    async getStatus(trackerAssignmentId: number, fetchAllIoParameters: boolean): Promise<TrackerAssignmentStatusDto | null> {

        const query = this.createQueryBuilder('trackerAssignment')
            .leftJoinAndSelect('trackerAssignment.tracker', 'tracker')
            .leftJoinAndSelect('tracker.vehicle', 'vehicle')
            .leftJoinAndSelect('trackerAssignment.latestData', 'latestData')
            .leftJoinAndSelect('latestData.parameters', 'parameters')
            .leftJoinAndSelect('parameters.ioParameter', 'ioParameter')
            .addSelect('ST_X(tracker.location::geometry)', 'tracker_longitude')
            .addSelect('ST_Y(tracker.location::geometry)', 'tracker_latitude')
            // Use raw SQL for latestData location
            .addSelect(`(SELECT ST_X(ld.location::geometry) FROM tracker_latest_data ld WHERE ld.tracker_assignment_id = trackerAssignment.id AND ld.extension_id IS NULL LIMIT 1)`, 'latestData_longitude')
            .addSelect(`(SELECT ST_Y(ld.location::geometry) FROM tracker_latest_data ld WHERE ld.tracker_assignment_id = trackerAssignment.id AND ld.extension_id IS NULL LIMIT 1)`, 'latestData_latitude')
            .where('trackerAssignment.id = :trackerAssignmentId', { trackerAssignmentId });

        const rawResult = await query.getRawOne();
        const trackerAssignment = await query.getOne();

        if (!trackerAssignment) {
            return null;
        }

        // Attach full precision coordinates to the tracker
        if (trackerAssignment.tracker && trackerAssignment.tracker.location && rawResult.tracker_longitude && rawResult.tracker_latitude) {
            trackerAssignment.tracker.location = {
                type: 'Point',
                coordinates: [
                    parseFloat(rawResult.tracker_longitude),
                    parseFloat(rawResult.tracker_latitude)
                ]
            };
        }

        // Attach full precision coordinates to the latestData
        if (trackerAssignment.latestData?.length > 0) {
            const mainData = trackerAssignment.latestData.find(d => d.extensionId === null);
            if (mainData) {
                mainData.location = {
                    type: 'Point',
                    coordinates: [
                        parseFloat(rawResult.latestData_longitude),
                        parseFloat(rawResult.latestData_latitude)
                    ]
                };
            }
        }

        return this.mapToStatusDto(trackerAssignment, fetchAllIoParameters);
    }

    private mapToStatusDto(trackerAssignment: TrackerAssignmentOrmEntity, fetchAllIoParameters: boolean): TrackerAssignmentStatusDto {
        const latestData = this.findLatestData(trackerAssignment);
        const latestExtensionData = this.findLatestExtensionData(trackerAssignment);

        return {
            connection: this.mapConnectionData(trackerAssignment.tracker),
            location: this.mapLocationData(trackerAssignment.tracker),
            vehicle: this.mapVehicleData(trackerAssignment.tracker?.vehicle),
            ioParameters: this.mapIoParameters(fetchAllIoParameters, latestData, latestExtensionData),
            speedParameterValue: latestData?.speed || 0
        };
    }

    private findLatestData(trackerAssignment: TrackerAssignmentOrmEntity): TrackerLatestDataOrmEntity | null {
        return trackerAssignment.latestData.find(data => data.extensionId === null) ?? null;
    }

    private findLatestExtensionData(trackerAssignment: TrackerAssignmentOrmEntity): TrackerLatestDataOrmEntity | null {
        return trackerAssignment.latestData.find(data => data.extensionId !== null) ?? null;
    }

    private mapConnectionData(tracker?: TrackerOrmEntity): TrackerAssignmentStatusConnection {
        if (!tracker) return null;

        return {
            lastTrackedAt: tracker.lastTrackedAt,
            lastConnectedAt: tracker.lastConnectedAt,
        };
    }

    private mapLocationData(tracker?: TrackerOrmEntity): MinimalLocationB1 {
        if (!tracker || !tracker?.location) return null;

        const { latitude, longitude } = GeoUtils.pointToLatLng(tracker.location);
        return {
            lat: latitude,
            lng: longitude,
            speed: tracker.speed,
            angle: tracker.angle,
            altitude: tracker.altitude,
        };
    }

    private mapVehicleData(vehicle: VehicleOrmEntity): MinimalVehicleInfo {
        if (!vehicle) return null;

        return {
            plaqueNo: vehicle.plaqueNo,
            plaqueType: vehicle.plaqueType,
            plaqueStatus: vehicle.plaqueStatus,
            id: vehicle.id,
            name: vehicle.vehicleModelName,
        };
    }

    private mapIoParameters(
        fetchAllIoParameters: boolean,
        latestData?: TrackerLatestDataOrmEntity,
        latestExtensionData?: TrackerLatestDataOrmEntity,
    ): TrackerAssignmentStatusIoParameters[] {
        const parameters: TrackerAssignmentStatusIoParameters[] = [];

        if (latestData) {
            parameters.push(...this.mapSingleIoParameters(latestData, false, fetchAllIoParameters));
        }

        if (latestExtensionData) {
            parameters.push(...this.mapSingleIoParameters(latestExtensionData, true, fetchAllIoParameters));
        }

        return parameters;
    }

    private mapSingleIoParameters(
        data: TrackerLatestDataOrmEntity,
        isExtension: boolean,
        fetchAllIoParameters: boolean
    ): TrackerAssignmentStatusIoParameters[] {
        if (!data.parameters) {
            return [];
        }

        return data.parameters
            .filter(parameter => this.isValidIoParameter(parameter, fetchAllIoParameters))
            .map(parameter => this.mapToIoParameterDto(parameter, isExtension));
    }

    private isValidIoParameter(
        parameter: TrackerDataParameterOrmEntity,
        fetchAllIoParameters: boolean
    ): boolean {
        const ioParameter = parameter.ioParameter;

        return ioParameter &&
            (fetchAllIoParameters || ioParameter.showInPanel) &&
            !ioParameter.isEvent;
    }

    private mapToIoParameterDto(
        parameter: TrackerDataParameterOrmEntity,
        isExtension: boolean
    ): TrackerAssignmentStatusIoParameters {
        return {
            id: parameter.ioParameter.id,
            isExtension,
            name: parameter.ioParameter.name,
            value: parameter.ioParameterValue,
            unit: parameter.ioParameter.measurementUnit,
            icon: parameter.ioParameter.icon,
        };
    }

    //#endregion

    //#region  Get Info
    async getInfo(trackerAssignmentId: number): Promise<TrackerAssignmentInfoDto | null> {
        const trackerAssignment = await this.findOne({
            where: { id: trackerAssignmentId },
            relations: [
                'trackingDevice',
                'trackingDevice.model',
                'trackingDevice.model.brand',
                'tracker'
            ]
        });

        if (!trackerAssignment) {
            return null;
        }

        return this.mapToInfoDto(trackerAssignment);
    }

    private mapToInfoDto(trackerAssignment: TrackerAssignmentOrmEntity): TrackerAssignmentInfoDto {
        const { trackingDevice, tracker } = trackerAssignment;

        return {
            imei: trackingDevice?.imei ?? '',
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            deviceSerialNumber: trackingDevice?.serialNumber || '',
            deviceBrandingName: DeviceBrandingNameDomainUtils.getBrandingNameFromProperties(
                trackingDevice?.model.caption,
                trackingDevice?.model.name,
                trackingDevice?.model?.brand.caption,
                trackingDevice?.model?.brand.name,
            ),
            deviceSimCardNumber: trackingDevice?.simNumber || '',
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            lastTrackedAt: tracker?.lastTrackedAt || null,
            lastConnectedAt: tracker?.lastConnectedAt || null,
        };
    }

    //#endregion

    //#region  Exists Tracker Assignment
    async existsTrackerAssignment(trackerAssignmentId: number): Promise<boolean> {
        const result = await this.findOne({
            where: {
                id: trackerAssignmentId,
            },
        });
        return result !== null;
    }

    //#endregion

    //#region  Get Latest Location
    async getLatestLocation(trackerAssignmentId: number): Promise<MinimalLocationB1 | null> {
        const trackerAssignment = await this.findOne({
            where: {
                id: trackerAssignmentId,
            },
            relations: ['latestData']
        });
        return trackerAssignment && trackerAssignment.latestData && trackerAssignment.latestData.length > 0 ? {
            lat: GeoUtils.pointToLatLng(trackerAssignment.latestData[0].location).latitude,
            lng: GeoUtils.pointToLatLng(trackerAssignment.latestData[0].location).longitude,
            speed: trackerAssignment.latestData[0].speed,
            angle: trackerAssignment.latestData[0].angle,
            altitude: trackerAssignment.latestData[0].altitude,
        } : null;
    }
    //#endregion

    //#region  Get Update Info
    async getUpdateInfo(trackerAssignmentId: number): Promise<TrackerAssignmentUpdateInfo | null> {
        const trackerAssignment = await this.findOne({
            where: {
                id: trackerAssignmentId,
            },
            relations: ['trackingDevice', 'trackingDevice.model', 'tracker', 'tracker.vehicle']
        });

        return trackerAssignment ? {
            id: trackerAssignment.id,
            isDefault: trackerAssignment.isDefault,
            terminalNumber: trackerAssignment.terminalNumber,
            imei: trackerAssignment.trackingDevice.imei,
            modelId: trackerAssignment.trackingDevice.modelId,
            serialNumber: trackerAssignment.trackingDevice.serialNumber,
            simNumber: trackerAssignment.trackingDevice.simNumber,
            identity: trackerAssignment.trackingDevice.identity,
            remotePassword: trackerAssignment.trackingDevice.remotePassword,
            plaqueStatus: trackerAssignment.tracker.vehicle.plaqueStatus,
            plaqueType: trackerAssignment.tracker.vehicle.plaqueType,
            plaqueNo: trackerAssignment.tracker.vehicle.plaqueNo,
            brandId: trackerAssignment.trackingDevice.model.brandId,
        } : null;
    }
    //#endregion

    //#region  Clear Default Assignments For Tracker
    async clearDefaultAssignmentsForTracker(trackerId: number): Promise<void> {
        await this.createQueryBuilder()
            .update(TrackerAssignmentOrmEntity)
            .set({ isDefault: false })
            .where("tracker_id = :trackerId", { trackerId })
            .andWhere("is_default = true")
            .andWhere("end_date IS NULL")
            .execute();
    }
    //#endregion

    //#region  Update Tracker Assignment
    async updateTrackerAssignment(trackerAssignment: TrackerAssignment): Promise<void> {
        await this.update(trackerAssignment.getId(),
            {
                trackingDeviceId: trackerAssignment.getTrackingDeviceId(),
                isDefault: trackerAssignment.getIsDefault()
            });
    }
    //#endregion

    //#region  Has Latest Data
    async hasLatestData(trackerAssignmentId: number): Promise<boolean> {
        const assignment = await this.createQueryBuilder('assignment')
            .leftJoinAndSelect('assignment.latestData', 'latestData')
            .where('assignment.id = :id', { id: trackerAssignmentId })
            .getOne();

        return !!assignment?.latestData?.length;
    }
    //#endregion

    //#region  Change To Default Assignment
    async changeToDefaultAssignment(trackerAssignment: TrackerAssignment): Promise<void> {
        await this.update(trackerAssignment.getId(),
            {
                isDefault: trackerAssignment.getIsDefault()
            });
    }
    //#endregion

    //#region  End Assignment
    async endAssignment(trackerAssignment: TrackerAssignment): Promise<void> {
        await this.update(trackerAssignment.getId(),
            {
                endDate: trackerAssignment.getEndDate(),
                isDefault: trackerAssignment.getIsDefault()
            });
    }
    //#endregion

    //#region  Grid
    async grid(
        filter: BaseGridViewDto,
        businessExternalId: string
    ): Promise<GridViewDto<TrackerAssignmentGridResponseDto>> {
        const query = this.buildBaseGridQuery(businessExternalId);
        return this.gridUtilsService.applySearchFilters(
            this,
            query,
            filter,
            this.mapToGridDto,
            this.getGridConfig()
        );
    }

    private getGridConfig(): GridConfig {
        return {
            searchableFields: [
                { name: 'trackerAssignment.terminalNumber', searchType: 'contains', priority: 3 },
                { name: 'trackingDevice.imei', searchType: 'contains', priority: 2 },
                { name: 'trackingDevice.serialNumber', priority: 1, searchType: 'contains' },
                { name: 'vehicle.identity', priority: 2, searchType: 'contains' },
                { name: 'vehicle.plaqueNo', searchType: 'contains', priority: 2 },
            ],
            sortableFields: [
                { fieldPath: 'trackerAssignment.id', defaultDirection: 'DESC' },
                { fieldPath: 'trackerAssignment.terminalNumber', defaultDirection: 'ASC' },
                { fieldPath: 'trackingDevice.imei' },
                { fieldPath: 'vehicle.identity' },
                { fieldPath: 'startDate', defaultDirection: 'DESC' },
            ],
            defaultSort: 'trackerAssignment.id DESC'
        };
    }

    private buildBaseGridQuery(businessExternalId: string) {
        const query = this.createQueryBuilder('trackerAssignment')
            .leftJoinAndSelect('trackerAssignment.trackingDevice', 'trackingDevice')
            .leftJoinAndSelect('trackingDevice.model', 'model')
            .leftJoinAndSelect('trackerAssignment.tracker', 'tracker')
            .leftJoinAndSelect('tracker.vehicle', 'vehicle')
            .leftJoinAndSelect('tracker.business', 'business')
            .where('business.external_id = :businessExternalId', { businessExternalId });

        return query;
    }

    private mapToGridDto(ormEntity: TrackerAssignmentOrmEntity): TrackerAssignmentGridResponseDto {
        const { tracker, trackingDevice } = ormEntity;
        const { vehicle } = tracker;
        const { model } = trackingDevice;

        return {
            id: ormEntity.id,
            vehicleIdentityNo: vehicle.identity,
            vehiclePlaqueNo: vehicle.plaqueNo,
            vehiclePlaqueType: vehicle.plaqueType,
            vehiclePlaqueStatus: vehicle.plaqueStatus,
            imei: trackingDevice.imei,
            terminalNumber: ormEntity.terminalNumber,
            isDefault: ormEntity.isDefault,
            serialNumber: trackingDevice.serialNumber,
            simCardNumber: trackingDevice.simNumber,
            remotePassword: trackingDevice.remotePassword,
            startDate: ormEntity.startDate,
            endDate: ormEntity.endDate,
            isSupportedExtension: model.isSupportedExtension,
        };
    }
    //#endregion

    //#region  Get Active Devices For Registeration
    async getActiveDevicesForRegisteration(pageIndex: number, pageSize: number): Promise<TrackerAssignmentDevicesRegisterationDto[]> {
        const result = await this.find({
            skip: (pageIndex - 1) * pageSize,
            take: pageSize,
            where: {
                endDate: IsNull(),
            },
            relations: ['trackingDevice', 'trackingDevice.model'],
        });
        return result.map(trackerAssignment => {
            return {
                isDelete: false,
                isMobile: trackerAssignment.trackingDevice.model.isMobile,
                imei: trackerAssignment.trackingDevice.imei,
                serial: trackerAssignment.trackingDevice.serialNumber,
                caption: trackerAssignment.trackingDevice.model.name,
                simCardNumber: trackerAssignment.trackingDevice.simNumber,
                remoteDynamicPassword: trackerAssignment.trackingDevice.remotePassword,
                deviceIdentity: trackerAssignment.trackingDevice.identity,
                description: '',
                modelId: trackerAssignment.trackingDevice.model.externalId,
                terminalNo: trackerAssignment.terminalNumber,
                activeStatus: ActiveStatus.Active,
            }
        }) || [];
    }
    //#endregion

    //#region  Exists By Terminal Number
    async existsByTerminalNumber(terminalNumber: string): Promise<boolean> {
        const result = await this.findOne({
            where: { terminalNumber },
        });
        return result !== null;
    }
    //#endregion

    //#region  Create Tracker Assignment
    async createTrackerAssignment(trackerAssignment: TrackerAssignment): Promise<TrackerAssignment> {
        const trackerAssignmentOrm = this.mapCreateToOrm(trackerAssignment);
        await this.save(trackerAssignmentOrm);
        return this.mapToDomain(trackerAssignmentOrm);
    }

    private mapCreateToOrm(trackerAssignment: TrackerAssignment): TrackerAssignmentOrmEntity {
        const trackerAssignmentOrm = new TrackerAssignmentOrmEntity();
        trackerAssignmentOrm.trackerId = trackerAssignment.getTrackerId();
        trackerAssignmentOrm.trackingDeviceId = trackerAssignment.getTrackingDeviceId();
        trackerAssignmentOrm.terminalNumber = trackerAssignment.getTerminalNumber();
        trackerAssignmentOrm.isDefault = trackerAssignment.getIsDefault();
        trackerAssignmentOrm.startDate = trackerAssignment.getStartDate();
        return trackerAssignmentOrm;
    }

    private mapToDomain(trackerAssignmentOrm: TrackerAssignmentOrmEntity): TrackerAssignment {
        return TrackerAssignment.mapToDomain({
            id: trackerAssignmentOrm.id,
            terminalNumber: trackerAssignmentOrm.terminalNumber,
            isDefault: trackerAssignmentOrm.isDefault,
            startDate: trackerAssignmentOrm.startDate,
            endDate: trackerAssignmentOrm.endDate,
            trackingDeviceId: trackerAssignmentOrm.trackingDeviceId,
            trackerId: trackerAssignmentOrm.trackerId,
        });
    }
    //#endregion

    //#region  Get By Tracker Assignment Id
    async getByTrackerAssignmentId(trackerAssignmentId: number): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                id: trackerAssignmentId,
            },
        });

        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion

    //#region  Get Tracker Assignment By Terminal Number
    async getTrackerAssignmentByTerminalNumber(terminalNumber: string): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                terminalNumber
            },
        });

        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion

    //#region  Get Active Tracker Assignment By Terminal Number
    async getActiveTrackerAssignmentByTerminalNumber(terminalNumber: string): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                terminalNumber,
                endDate: IsNull(),
            },
        });

        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion



    //#region  Find One Active Assignment By Tracker Id
    async findOneActiveAssignmentByTrackerId(trackerId: number): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                trackerId,
                endDate: IsNull(),
            },
        });
        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion

    //#region  Find Active Default Assignment By VehicleId
    async findActiveDefaultAssignmentByVehicleId(vehicleId: number): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                tracker: { vehicleId },
                endDate: IsNull(),
                isDefault: true,
            },
        });
        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion

    //#region  Find Active Default Assignment By Imei
    async findActiveDefaultAssignmentByImei(imei: string): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                trackingDevice: { imei },
                endDate: IsNull(),
                isDefault: true,
            },
        });
        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion

    //#region  Find Active Assignment By Imei
    async findActiveAssignmentByImei(imei: string): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                trackingDevice: { imei },
                endDate: IsNull(),
            },
        });
        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion

    //#region  Find Assignment By Imei
    async findAssignmentByImei(imei: string): Promise<TrackerAssignment | null> {
        const trackerAssignment = await this.findOne({
            where: {
                trackingDevice: { imei },
            },
        });
        return trackerAssignment ? TrackerAssignment.mapToDomain({
            id: trackerAssignment.id,
            terminalNumber: trackerAssignment.terminalNumber,
            isDefault: trackerAssignment.isDefault,
            startDate: trackerAssignment.startDate,
            endDate: trackerAssignment.endDate,
            trackingDeviceId: trackerAssignment.trackingDeviceId,
            trackerId: trackerAssignment.trackerId,
        }) : null;
    }
    //#endregion
}