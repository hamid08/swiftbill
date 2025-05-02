import { ScenarioSetting } from "./scenario-setting.entity";

export const ScenarioSettingRepository = Symbol(
    'ScenarioSettingRepository',
).valueOf();
export interface ScenarioSettingRepository {

    getScenarioSetting(): Promise<ScenarioSetting | null>;
    updateScenarioSetting(setting: ScenarioSetting): Promise<number | null>;
    createScenarioSetting(setting: ScenarioSetting): Promise<number | null>;
}
