import { ICommand } from '@nestjs/cqrs';
import { ApplicationSettingUpdateDto } from '../../dtos';

export class ApplicationSettingUpdateCommand implements ICommand {
    constructor(public readonly settingDto: ApplicationSettingUpdateDto) { }
}
