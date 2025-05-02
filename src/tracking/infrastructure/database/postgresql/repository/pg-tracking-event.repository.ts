import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between, In } from 'typeorm';
import { TrackingEventOrmEntity } from '../entities';
import {
    TrackingEvent,
    TrackingEventAssignmentGridResponseDto,
    TrackingEventAttribute,
    TrackingEventDetailResponseDto,
    TrackingEventFilterType,
    TrackingEventGridResponseDto,
    TrackingEventLevel,
    TrackingEventRepository
} from 'src/tracking/domain';
import { chunk } from 'lodash';
import { BaseGridViewDto, GridViewDto, GridUtilsService, GeoUtils } from 'src/common';

@Injectable()
export class PgTrackingEventRepo extends Repository<TrackingEventOrmEntity> implements TrackingEventRepository {
    private static readonly BATCH_SIZE = 100;
    private static readonly DUPLICATE_TIME_WINDOW_MS = 300000; // 5 minutes

    constructor(
        private readonly dataSource: DataSource,
        private readonly gridUtils: GridUtilsService,
    ) {
        super(TrackingEventOrmEntity, dataSource.createEntityManager());
    }

    async markAsRead(ids: number[]): Promise<void> {
        await this.update(
            { id: In(ids), isSeen: false },
            { isSeen: true }
        );
    }

    async getAssignmentGrid(
        filter: BaseGridViewDto,
        trackerAssignmentId: number,
        fromDate?: Date,
        toDate?: Date
    ): Promise<GridViewDto<TrackingEventAssignmentGridResponseDto>> {
        const query = this.buildAssignmentGridQuery(trackerAssignmentId, fromDate, toDate);
        return this.gridUtils.applySearchFilters(
            this,
            query,
            filter,
            this.toAssignmentGridItemDto.bind(this)
        );
    }

    private buildAssignmentGridQuery(trackerAssignmentId: number, fromDate?: Date, toDate?: Date) {
        const query = this.buildDetailQuery()
            .where('trackingEvent.trackerAssignmentId = :trackerAssignmentId', { trackerAssignmentId });

        if (fromDate) {
            query.andWhere('trackingEvent.occurredAt >= :fromDate', { fromDate });
        }
        if (toDate) {
            query.andWhere('trackingEvent.occurredAt <= :toDate', { toDate });
        }

        return query;
    }

    private toAssignmentGridItemDto(ormEntity: TrackingEventOrmEntity): TrackingEventAssignmentGridResponseDto {
        return {
            id: ormEntity.id,
            eventCaption: PgTrackingEventRepo.resolveEventCaption(ormEntity),
            eventTime: ormEntity.occurredAt,
            isExtension: ormEntity.trackingExtensionId !== null,
            level: ormEntity.level,
            location: PgTrackingEventRepo.mapLocation(ormEntity),
        };
    }

    async getTrackingEventById(id: number): Promise<TrackingEvent | null> {
        const ormEntity = await this.findOne({
            where: { id: id },
        });

        return ormEntity ? this.mapToDomain(ormEntity) : null;
    }

    private mapToDomain(trackerOrm: TrackingEventOrmEntity): TrackingEvent {
        return TrackingEvent.mapToDomain({
            id: trackerOrm.id,
            ioParameterId: trackerOrm.ioParameterId,
            occurredAt: trackerOrm.occurredAt,
            level: trackerOrm.level,
            isSeen: trackerOrm.isSeen,
            trackerAssignmentId: trackerOrm.trackerAssignmentId,
            ioParameterValue: trackerOrm.ioParameterValue,
        });
    }

    async getDetail(id: number): Promise<TrackingEventDetailResponseDto | null> {
        const event = await this.buildDetailQuery()
            .where('trackingEvent.id = :id', { id })
            .getOne();

        return event ? this.toDetailDto(event) : null;
    }

    async getGrid(
        filter: BaseGridViewDto,
        businessExternalId: string,
        filterType: TrackingEventFilterType
    ): Promise<GridViewDto<TrackingEventGridResponseDto>> {
        const query = this.buildGridQuery(businessExternalId, filterType);
        return this.gridUtils.applySearchFilters(
            this,
            query,
            filter,
            this.toGridItemDto.bind(this)
        );
    }

    async hasDuplicateInTimeWindow(event: TrackingEvent): Promise<boolean> {
        const { startTime, endTime } = this.getTimeWindow(event.getOccurredAt());

        const count = await this.count({
            where: {
                ioParameterId: event.getIoParameterId(),
                occurredAt: Between(startTime, endTime)
            }
        });

        return count > 0;
    }

    async bulkInsert(events: TrackingEvent[]): Promise<void> {
        const entities = events.map(event => this.toOrmEntity(event));
        const chunks = chunk(entities, PgTrackingEventRepo.BATCH_SIZE);

        await this.dataSource.transaction(async manager => {
            for (const batch of chunks) {
                await manager.insert(TrackingEventOrmEntity, batch);
            }
        });
    }

    private buildDetailQuery() {
        return this.createQueryBuilder('trackingEvent')
            .leftJoinAndSelect('trackingEvent.trackerAssignment', 'trackerAssignment')
            .leftJoinAndSelect('trackingEvent.ioParameter', 'ioParameter')
            .leftJoinAndSelect('ioParameter.values', 'ioParameterValues')
            .leftJoinAndSelect('trackerAssignment.tracker', 'tracker')
            .leftJoinAndSelect('tracker.vehicle', 'vehicle')
            .leftJoinAndSelect('tracker.business', 'business')
            .leftJoinAndSelect('trackerAssignment.trackingDevice', 'trackingDevice');
    }

    private buildGridQuery(businessExternalId: string, filterType: TrackingEventFilterType) {
        const query = this.buildDetailQuery()
            .where('business.external_id = :businessExternalId', { businessExternalId });

        if (filterType !== TrackingEventFilterType.All) {
            const isSeen = filterType === TrackingEventFilterType.Read;
            query.andWhere('trackingEvent.isSeen = :isSeen', { isSeen });
        }

        return query;
    }

    private toDetailDto(ormEntity: TrackingEventOrmEntity): TrackingEventDetailResponseDto {
        return {
            id: ormEntity.id,
            trackerId: ormEntity.trackerAssignment?.tracker?.id,
            vehicleId: ormEntity.trackerAssignment?.tracker?.vehicle?.id,
            eventTime: ormEntity.occurredAt,
            eventCaption: PgTrackingEventRepo.resolveEventCaption(ormEntity),
            vehicleName: ormEntity.trackerAssignment?.tracker?.vehicle?.name ||
                ormEntity.trackerAssignment?.tracker?.vehicle?.vehicleModelName,
            plaqueNo: ormEntity.trackerAssignment?.tracker?.vehicle?.plaqueNo,
            identityNo: ormEntity.trackerAssignment?.tracker?.vehicle?.identity,
            plaqueStatus: ormEntity.trackerAssignment?.tracker?.vehicle?.plaqueStatus,
            plaqueType: ormEntity.trackerAssignment?.tracker?.vehicle?.plaqueType,
            location: PgTrackingEventRepo.mapLocation(ormEntity),
            trackerExtensionId: ormEntity.trackingExtensionId,
            attributes: this.buildAttributes(ormEntity),
        };
    }

    private toGridItemDto(ormEntity: TrackingEventOrmEntity): TrackingEventGridResponseDto {
        return {
            id: ormEntity.id,
            eventTime: ormEntity.occurredAt,
            eventCaption: PgTrackingEventRepo.resolveEventCaption(ormEntity),
            vehicleName: ormEntity.trackerAssignment?.tracker?.vehicle?.name ||
                ormEntity.trackerAssignment?.tracker?.vehicle?.userTypeName,
            isSeen: ormEntity.isSeen,
            identityNo: ormEntity.trackerAssignment?.tracker?.vehicle?.identity,
            plaqueNo: ormEntity.trackerAssignment?.tracker?.vehicle?.plaqueNo,
            plaqueStatus: ormEntity.trackerAssignment?.tracker?.vehicle?.plaqueStatus,
            plaqueType: ormEntity.trackerAssignment?.tracker?.vehicle?.plaqueType,
        };
    }

    private toOrmEntity(event: TrackingEvent): TrackingEventOrmEntity {
        const entity = new TrackingEventOrmEntity();
        entity.location = event.getLocation();
        entity.angle = event.getAngle();
        entity.altitude = event.getAltitude();
        entity.speed = event.getSpeed();
        entity.occurredAt = event.getOccurredAt();
        entity.level = event.getLevel();
        entity.isSeen = event.getIsSeen();
        entity.trackerAssignmentId = event.getTrackerAssignmentId();
        entity.ioParameterId = event.getIoParameterId();
        entity.trackingExtensionId = event.getTrackingExtensionId();
        return entity;
    }

    private static resolveEventCaption(ormEntity: TrackingEventOrmEntity): string {
        const matchingValue = ormEntity.ioParameter?.values
            ?.find(v => v.valueKey === ormEntity.ioParameter?.parameterKey);
        return matchingValue?.caption ?? ormEntity.ioParameter?.caption ?? '';
    }

    private buildAttributes(ormEntity: TrackingEventOrmEntity): TrackingEventAttribute[] {
        const attributes: TrackingEventAttribute[] = [
            {
                key: 'سطح رخداد',
                value: this.getEventLevelLabel(ormEntity.level),
            },
            {
                key: 'نوع دستگاه',
                value: ormEntity.trackingExtensionId ? 'افزونه' : 'ردیاب',
            }
        ];

        const deviceIdentifier = this.getDeviceIdentifier(ormEntity);
        if (deviceIdentifier) {
            attributes.push({
                key: ormEntity.trackingExtensionId ? 'شناسه افزونه' : 'شناسه ردیاب',
                value: deviceIdentifier,
            });
        }

        return attributes;
    }

    private getEventLevelLabel(level: TrackingEventLevel): string {
        switch (level) {
            case TrackingEventLevel.Error: return 'خطر';
            case TrackingEventLevel.Warning: return 'هشدار';
            default: return 'اطلاع رسانی';
        }
    }

    private getDeviceIdentifier(ormEntity: TrackingEventOrmEntity): string | null {
        if (!ormEntity.trackerAssignment?.trackingDevice) return null;

        const device = ormEntity.trackerAssignment.trackingDevice;
        return ormEntity.trackingExtensionId
            ? `${device.imei} - ${ormEntity.trackingExtensionId}`
            : `${device.imei} - ${ormEntity.trackerAssignment.terminalNumber}`;
    }

    private static mapLocation(ormEntity: TrackingEventOrmEntity) {
        if (!ormEntity.location) return null;

        const { latitude, longitude } = GeoUtils.pointToLatLng(ormEntity.location);
        return {
            altitude: ormEntity.altitude,
            angle: ormEntity.angle,
            speed: ormEntity.speed,
            lat: latitude,
            lng: longitude,
        };
    }

    private getTimeWindow(eventTime: Date) {
        const time = new Date(eventTime);
        return {
            startTime: new Date(time.getTime() - PgTrackingEventRepo.DUPLICATE_TIME_WINDOW_MS),
            endTime: new Date(time.getTime() + PgTrackingEventRepo.DUPLICATE_TIME_WINDOW_MS)
        };
    }
}