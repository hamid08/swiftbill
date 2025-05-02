import { ICommand } from '@nestjs/cqrs';
import { TransportBusinessBrokerSyncModel } from './transport-business-broker-sync.models';
export class TransportBusinessBrokerSyncCommand implements ICommand {
    constructor(public readonly data: TransportBusinessBrokerSyncModel) { }
}