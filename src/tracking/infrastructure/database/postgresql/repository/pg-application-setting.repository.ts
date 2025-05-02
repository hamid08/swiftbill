import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApplicationSetting, ApplicationSettingDomainDto, ApplicationSettingRepository } from 'src/tracking/domain';
import { ApplicationSettingOrmEntity } from '../entities';

@Injectable()
export class PgApplicationSettingRepo extends Repository<ApplicationSettingOrmEntity> implements ApplicationSettingRepository {
  constructor(private dataSource: DataSource
  ) {
    super(ApplicationSettingOrmEntity, dataSource.createEntityManager());
  }

  /**
   * Retrieves the application settings from the database.
   * @returns A Promise resolving to the ApplicationSetting domain entity or null if not found.
   */
  async getApplicationSetting(): Promise<ApplicationSetting | null> {
    const settings = await this.find({ take: 1 });
    if (settings.length === 0) {
      return null;
    }

    const setting = settings[0];

    // Map to domain using DTO
    const settingDto: ApplicationSettingDomainDto = {
      id: setting.id,
      ...setting
    };

    return ApplicationSetting.mapToDomain(settingDto);
  }

  /**
   * Creates a new application setting in the database.
   * @param setting - The ApplicationSetting domain entity to be created.
   * @returns A Promise resolving to the created ApplicationSetting domain entity.
   */
  async createApplicationSetting(setting: ApplicationSetting): Promise<number | null> {
    const savedEntity = this.create({
      maxTimeBetweenTripInMinutes: setting.getMaxTimeBetweenTripInMinutes(),
      maxDistanceBetweenPositionsInMeters: setting.getMaxDistanceBetweenPositionsInMeters(),
      minTimeToDetectConnectedTracker: setting.getMinTimeToDetectConnectedTracker(),
      maxOverspeedDurationSeconds: setting.getMaxOverspeedDurationSeconds(),
      minAllowedSpeedKmPerHour: setting.getMinAllowedSpeedKmPerHour(),
      faultDataMaxAllowedSpeedKmPerHour: setting.getFaultDataMaxAllowedSpeedKmPerHour(),
      faultDataMinPointDistanceKm: setting.getFaultDataMinPointDistanceKm(),
      missingDataDetectionTimeMinutes: setting.getMissingDataDetectionTimeMinutes(),
    });

    await this.save(savedEntity);
    return savedEntity.id;
  }

  /**
 * Updates an existing application setting in the database.
 * @param setting - The ApplicationSetting domain entity to be updated.
 * @returns A Promise resolving to the ID of the updated record.
 */
  async updateApplicationSetting(setting: ApplicationSetting): Promise<number | null> {
    const id = setting.getId();

    const updateResult = await this.update(
      { id }, // Update condition (where id matches)
      {
        maxTimeBetweenTripInMinutes: setting.getMaxTimeBetweenTripInMinutes(),
        maxDistanceBetweenPositionsInMeters: setting.getMaxDistanceBetweenPositionsInMeters(),
        minTimeToDetectConnectedTracker: setting.getMinTimeToDetectConnectedTracker(),
        maxOverspeedDurationSeconds: setting.getMaxOverspeedDurationSeconds(),
        minAllowedSpeedKmPerHour: setting.getMinAllowedSpeedKmPerHour(),
        faultDataMaxAllowedSpeedKmPerHour: setting.getFaultDataMaxAllowedSpeedKmPerHour(),
        faultDataMinPointDistanceKm: setting.getFaultDataMinPointDistanceKm(),
        missingDataDetectionTimeMinutes: setting.getMissingDataDetectionTimeMinutes(),
      },
    );

    if (updateResult.affected && updateResult.affected > 0) {
      return id; 
    }

    return null; 
  }

}