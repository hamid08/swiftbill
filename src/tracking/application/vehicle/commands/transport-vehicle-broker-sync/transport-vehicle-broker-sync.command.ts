import { ICommand } from '@nestjs/cqrs';
import { TransportVehicleBrokerSyncModel } from './transport-vehicle-broker-sync.models';
export class TransportVehicleBrokerSyncCommand implements ICommand {
    constructor(public readonly data: TransportVehicleBrokerSyncModel) { }
}