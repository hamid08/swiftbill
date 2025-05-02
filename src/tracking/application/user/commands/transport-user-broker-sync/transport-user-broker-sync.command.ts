import { ICommand } from '@nestjs/cqrs';
export class TransportUserBrokerSyncCommand implements ICommand {
    constructor(public readonly data: TransportUserBrokerSyncModel) { }
}

export class TransportUserBrokerSyncModel {
    firstName: string;
    lastName: string;
    userName: string;
    id: string;
    business: string[];
}
