import { Inject, Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ApplicationSettingGetQuery } from './application-setting-get.query';
import { ApplicationSettingDto } from '../../dtos';
import { ApplicationSetting, ApplicationSettingRepository } from 'src/tracking/domain';

@Injectable()
@QueryHandler(ApplicationSettingGetQuery)
export class ApplicationSettingGetQueryHandler
    implements IQueryHandler<ApplicationSettingGetQuery, ApplicationSettingDto> {

    private readonly logger = new Logger(ApplicationSettingGetQueryHandler.name);
    private readonly defaultSettings = {
        faultDataMaxAllowedSpeedKmPerHour: 0,
        faultDataMinPointDistanceKm: 0,
        maxDistanceBetweenPositionsInMeters: 0,
        maxOverspeedDurationSeconds: 0,
        maxTimeBetweenTripInMinutes: 0,
        minAllowedSpeedKmPerHour: 0,
        minTimeToDetectConnectedTracker: 0,
        missingDataDetectionTimeMinutes: 0
    };

    constructor(
        @Inject(ApplicationSettingRepository)
        private readonly repository: ApplicationSettingRepository,
    ) { }

    async execute(query: ApplicationSettingGetQuery): Promise<ApplicationSettingDto> {
        let settings = await this.getOrCreateSettings();
        return this.mapToDto(settings);
    }

    private async getOrCreateSettings(): Promise<ApplicationSetting> {
        const existingSettings = await this.repository.getApplicationSetting();
        if (existingSettings) {
            return existingSettings;
        }

        const newSettings = ApplicationSetting.create(this.defaultSettings);
        await this.repository.createApplicationSetting(newSettings);
        return newSettings;
    }

    private mapToDto(settings: ApplicationSetting): ApplicationSettingDto {
        return {
            maxTimeBetweenTripInMinutes: settings.getMaxTimeBetweenTripInMinutes(),
            maxDistanceBetweenPositionsInMeters: settings.getMaxDistanceBetweenPositionsInMeters(),
            minTimeToDetectConnectedTracker: settings.getMinTimeToDetectConnectedTracker(),
            maxOverspeedDurationSeconds: settings.getMaxOverspeedDurationSeconds(),
            minAllowedSpeedKmPerHour: settings.getMinAllowedSpeedKmPerHour(),
            faultDataMaxAllowedSpeedKmPerHour: settings.getFaultDataMaxAllowedSpeedKmPerHour(),
            faultDataMinPointDistanceKm: settings.getFaultDataMinPointDistanceKm(),
            missingDataDetectionTimeMinutes: settings.getMissingDataDetectionTimeMinutes(),
        };
    }
}