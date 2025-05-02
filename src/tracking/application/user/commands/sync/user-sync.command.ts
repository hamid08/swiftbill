import { ICommand } from '@nestjs/cqrs';

export class UserSyncCommand implements ICommand {
    constructor() { }
}