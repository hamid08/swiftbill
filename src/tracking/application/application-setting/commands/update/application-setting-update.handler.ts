import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ApplicationSettingUpdateCommand } from './application-setting-update.command';
import { ApplicationSetting, ApplicationSettingCreateDomainDto, ApplicationSettingRepository, ApplicationSettingUpdateDomainDto } from 'src/tracking/domain';

@CommandHandler(ApplicationSettingUpdateCommand)
export class ApplicationSettingUpdateCommandHandler
    implements ICommandHandler<ApplicationSettingUpdateCommand, void> {
    private readonly logger = new Logger(ApplicationSettingUpdateCommandHandler.name);

    constructor(
        @Inject(ApplicationSettingRepository)
        private readonly applicationSettingRepository: ApplicationSettingRepository,
    ) { }

    async execute(command: ApplicationSettingUpdateCommand): Promise<void> {
        const { settingDto } = command;

        try {
            // Fetch the existing application setting
            const existingSetting = await this.applicationSettingRepository.getApplicationSetting();

            if (existingSetting) {
                // If a setting exists, update it
                await this.updateApplicationSetting({ ...settingDto, id: existingSetting.getId() });
            } else {
                // If no setting exists, create a new one
                await this.createApplicationSetting(settingDto);
            }

            this.logger.log('Application setting processed successfully.');
        } catch (error) {
            this.logger.error(`Failed to process application setting: ${error.message}`, error.stack);
            throw new Error('Failed to process application setting');
        }
    }

    /**
     * Creates a new application setting in the database.
     * @param settingDto - The data to create the application setting.
     */
    private async createApplicationSetting(settingDto: ApplicationSettingCreateDomainDto): Promise<void> {
        const newSetting = ApplicationSetting.create(settingDto);
        await this.applicationSettingRepository.createApplicationSetting(newSetting);
        this.logger.log('New application setting created successfully.');
    }

    /**
     * Updates an existing application setting in the database.
     * @param settingDto - The updated data for the application setting.
     */
    private async updateApplicationSetting(settingDto: ApplicationSettingUpdateDomainDto): Promise<void> {
        const updatedSetting = ApplicationSetting.update(settingDto);
        await this.applicationSettingRepository.updateApplicationSetting(updatedSetting);
        this.logger.log('Application setting updated successfully.');
    }
}