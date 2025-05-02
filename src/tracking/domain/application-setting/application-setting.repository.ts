import { ApplicationSetting } from "./application-setting.entity";

export const ApplicationSettingRepository = Symbol(
    'ApplicationSettingRepository',
).valueOf();
export interface ApplicationSettingRepository {

    getApplicationSetting(): Promise<ApplicationSetting | null>;
    updateApplicationSetting(setting: ApplicationSetting): Promise<number | null>;
    createApplicationSetting(setting: ApplicationSetting): Promise<number | null>;
}
