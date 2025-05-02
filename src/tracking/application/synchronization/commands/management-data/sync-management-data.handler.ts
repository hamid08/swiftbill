import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SyncManagementDataCommand } from './sync-management-data.command';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RMQ_CONSTANT } from 'src/common';

@CommandHandler(SyncManagementDataCommand)
export class SyncManagementDataCommandHandler implements ICommandHandler<SyncManagementDataCommand, void> {
    private readonly logger = new Logger(SyncManagementDataCommandHandler.name);

    constructor(
        private readonly amqpConnection: AmqpConnection,

    ) { }

    async execute(command: SyncManagementDataCommand): Promise<void> {
        await this.amqpConnection.publish(RMQ_CONSTANT.SYNC_MANAGEMENT_DATA.EXCHANGE, '', command);
        this.logger.log(`🚀 Published sync management data request to broker`);

    }


}