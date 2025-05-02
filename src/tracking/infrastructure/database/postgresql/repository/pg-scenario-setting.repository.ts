import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ScenarioSettingOrmEntity } from '../entities';
import { ScenarioSetting, ScenarioSettingDomainDto, ScenarioSettingRepository } from 'src/tracking/domain';

@Injectable()
export class PgScenarioSettingRepo extends Repository<ScenarioSettingOrmEntity> implements ScenarioSettingRepository {
  constructor(private dataSource: DataSource) {
    super(ScenarioSettingOrmEntity, dataSource.createEntityManager());
  }

  /**
   * Retrieves the Scenario settings from the database.
   * @returns A Promise resolving to the ScenarioSetting domain entity or null if not found.
   */
  async getScenarioSetting(): Promise<ScenarioSetting | null> {
    const settings = await this.find({ take: 1 });
    if (settings.length === 0) {
      return null;
    }

    const setting = settings[0];

    // Map to domain using DTO
    const settingDto: ScenarioSettingDomainDto = {
      id: setting.id,
      dailyRentalFee: setting.dailyRentalFee,
      dayStartHour: setting.dayStartHour,
      dayEndHour: setting.dayEndHour,
      maxOverstayingDurationDayInMinutes: setting.maxOverstayingDurationDayInMinutes,
      maxOverstayingDurationNightInMinutes: setting.maxOverstayingDurationNightInMinutes,
      allowedStopTimeInStopForbiddenAreaInMinutes: setting.allowedStopTimeInStopForbiddenAreaInMinutes,
    };

    return ScenarioSetting.mapToDomain(settingDto);
  }

  /**
   * Creates a new Scenario setting in the database.
   * @param setting - The ScenarioSetting domain entity to be created.
   * @returns A Promise resolving to the ID of the created record.
   */
  async createScenarioSetting(setting: ScenarioSetting): Promise<number | null> {
    const savedEntity = this.create({
      dailyRentalFee: setting.getDailyRentalFee(),
      dayStartHour: setting.getDayStartHour(),
      dayEndHour: setting.getDayEndHour(),
      maxOverstayingDurationDayInMinutes: setting.getMaxOverstayingDurationDayInMinutes(),
      maxOverstayingDurationNightInMinutes: setting.getMaxOverstayingDurationNightInMinutes(),
      allowedStopTimeInStopForbiddenAreaInMinutes: setting.getAllowedStopTimeInStopForbiddenAreaInMinutes(),
    });

    await this.save(savedEntity);
    return savedEntity.id;
  }

  /**
   * Updates an existing Scenario setting in the database.
   * @param setting - The ScenarioSetting domain entity to be updated.
   * @returns A Promise resolving to the ID of the updated record.
   */
  async updateScenarioSetting(setting: ScenarioSetting): Promise<number | null> {
    const id = setting.getId();

    const updateResult = await this.update(
      { id }, // Update condition (where id matches)
      {
        dailyRentalFee: setting.getDailyRentalFee(),
        dayStartHour: setting.getDayStartHour(),
        dayEndHour: setting.getDayEndHour(),
        maxOverstayingDurationDayInMinutes: setting.getMaxOverstayingDurationDayInMinutes(),
        maxOverstayingDurationNightInMinutes: setting.getMaxOverstayingDurationNightInMinutes(),
        allowedStopTimeInStopForbiddenAreaInMinutes: setting.getAllowedStopTimeInStopForbiddenAreaInMinutes(),
      },
    );

    if (updateResult.affected && updateResult.affected > 0) {
      return id;
    }

    return null;
  }
}