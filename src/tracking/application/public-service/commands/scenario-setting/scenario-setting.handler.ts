import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScenarioSettingCommand } from './scenario-setting.command';
import { ScenarioSetting, ScenarioSettingCreateDomainDto, ScenarioSettingRepository, ScenarioSettingUpdateDomainDto } from 'src/tracking/domain';

@CommandHandler(ScenarioSettingCommand)
export class ScenarioSettingCommandHandler implements ICommandHandler<ScenarioSettingCommand, void> {
    private readonly logger = new Logger(ScenarioSettingCommandHandler.name);

    constructor(
        @Inject(ScenarioSettingRepository)
        private readonly scenarioSettingRepository: ScenarioSettingRepository,
    ) { }

    async execute(command: ScenarioSettingCommand): Promise<void> {
        const { data } = command;

        try {

            // Fetch the existing scenario setting
            const existingSetting = await this.scenarioSettingRepository.getScenarioSetting();

            if (existingSetting) {
                // If a setting exists, update it
                await this.updateScenarioSetting({ ...data, id: existingSetting.getId() });
            } else {
                // If no setting exists, create a new one
                await this.createScenarioSetting(data);
            }

        } catch (error) {
            this.logger.error(`Failed to process scenario setting: ${error.message}`, error.stack);
        }
    }


    /**
     * Creates a new scenario setting in the database.
     * @param data - The data to create the scenario setting.
     */
    private async createScenarioSetting(data: ScenarioSettingCreateDomainDto): Promise<void> {
        const newSetting = ScenarioSetting.create(data);
        await this.scenarioSettingRepository.createScenarioSetting(newSetting);
        this.logger.log('New scenario setting created successfully.');
    }

    /**
     * Updates an existing scenario setting in the database.
     * @param data - The updated data for the scenario setting.
     */
    private async updateScenarioSetting(data: ScenarioSettingUpdateDomainDto): Promise<void> {
        const updatedSetting = ScenarioSetting.update(data);
        await this.scenarioSettingRepository.updateScenarioSetting(updatedSetting);
        this.logger.log('Scenario setting updated successfully.');
    }
}