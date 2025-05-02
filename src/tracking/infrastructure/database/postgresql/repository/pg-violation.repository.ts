import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository, MoreThanOrEqual, LessThanOrEqual, LessThan } from 'typeorm';
import { ViolationOrmEntity } from '../entities';
import { ViolationGridResponseDto, Violation, ViolationLocationType, ViolationRepository, ViolationType } from 'src/tracking/domain';
import { BaseGridViewDto, GeoUtils, GridUtilsService, GridViewDto } from 'src/common';

@Injectable()
export class PgViolationRepo extends Repository<ViolationOrmEntity> implements ViolationRepository {
  constructor(
    private dataSource: DataSource,
    private gridUtilsService: GridUtilsService,
  ) {
    super(ViolationOrmEntity, dataSource.createEntityManager());
  }


  async getViolationCountWithDateRange(
    trackerAssignmentId: number,
    fromDate: Date,
    toDate: Date
  ): Promise<number> {
    const query = this.count({
      where: {
        trackerAssignmentId,
        startDate: MoreThanOrEqual(fromDate),
        endDate: LessThanOrEqual(toDate),
      },
    });

    return await query;
  }

  async getByViolationId(violationId: number): Promise<Violation | null> {
    const ormEntity = await this.findOne({ where: { id: violationId } });
    return ormEntity ? Violation.mapToDomain(
      ormEntity.id,
      ormEntity.type,
      ormEntity.trackerAssignmentId,
      ormEntity.registerDate,
      ormEntity.startDate,
      ormEntity.endDate,
    ) : null;
  }

  async grid(filter: BaseGridViewDto, trackerAssignmentId: number, fromDate: Date | undefined, toDate: Date | undefined): Promise<GridViewDto<ViolationGridResponseDto>> {
    const queryBuilder = this
      .createQueryBuilder('violations')
      .where('violations.trackerAssignmentId = :trackerAssignmentId', { trackerAssignmentId })
      .leftJoinAndSelect('violations.locations', 'locations');

    if (fromDate) {
      queryBuilder.andWhere('violations.startDate >= :fromDate', { fromDate });
    }
    if (toDate) {
      queryBuilder.andWhere('violations.endDate <= :toDate OR violations.endDate IS NULL', { toDate });
    }

    return await this.gridUtilsService.applySearchFilters(this, queryBuilder, filter, this.mapViolationToDto);
  }

  private mapViolationToDto(entity: ViolationOrmEntity): ViolationGridResponseDto {
    const startLocation = entity.locations?.find(x => x.locationType === ViolationLocationType.Start);
    const endLocation = entity.locations?.find(x => x.locationType === ViolationLocationType.End);

    return {
      id: entity.id,
      type: entity.type,
      registerDate: entity.registerDate,
      trafficDate: entity.startDate,
      endDate:entity.endDate,
      startLocation: startLocation ? {
        altitude: startLocation.altitude,
        longitude: GeoUtils.pointToLatLng(startLocation.location)?.longitude,
        latitude: GeoUtils.pointToLatLng(startLocation.location)?.latitude,
        angle: startLocation.angle,
      } : null,
      endLocation: endLocation ? {
        altitude: endLocation.altitude,
        longitude: GeoUtils.pointToLatLng(endLocation.location)?.longitude,
        latitude: GeoUtils.pointToLatLng(endLocation.location)?.latitude,
        angle: endLocation.angle,
      } : null,
    };
  }

  async completeViolation(violationId: number, endDate: Date): Promise<void> {
    await this.update({ id: violationId }, { endDate });
  }

  async hasViolationStarted(trackerAssignmentId: number, violationType: ViolationType): Promise<boolean> {
    try {
      const violation = await this.exists({
        where: {
          trackerAssignmentId,
          type: violationType,
          endDate: IsNull(),
        },
      });

      return violation;
    } catch (error) {
      return false;
    }
  }

  async createViolation(violation: Violation): Promise<number | null> {
    const ormEntity = new ViolationOrmEntity();
    ormEntity.type = violation.getType();
    ormEntity.registerDate = violation.getRegisterDate();
    ormEntity.startDate = violation.getStartDate();
    ormEntity.trackerAssignmentId = violation.getTrackerAssignmentId();

    return (await this.save(ormEntity)).id;
  }

  async getCurrentViolation(trackerAssignmentId: number, violationType: ViolationType): Promise<Violation | null> {
    const ormEntity = await this.findOne({
      where: {
        trackerAssignmentId,
        type: violationType,
        endDate: IsNull(),
      },
    });

    return ormEntity ? Violation.mapToDomain(
      ormEntity.id,
      ormEntity.type,
      ormEntity.trackerAssignmentId,
      ormEntity.registerDate,
      ormEntity.startDate,
      ormEntity.endDate,
    ) : null;
  }
}