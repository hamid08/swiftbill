import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Business, BusinessRepository } from 'src/tracking/domain';
import { TransportBusinessBrokerSyncCommand } from './transport-business-broker-sync.command';

@CommandHandler(TransportBusinessBrokerSyncCommand)
export class TransportBusinessBrokerSyncCommandHandler implements ICommandHandler<TransportBusinessBrokerSyncCommand, void> {
    private readonly logger = new Logger(TransportBusinessBrokerSyncCommandHandler.name);

    constructor(
        @Inject(BusinessRepository)
        private readonly businessRepository: BusinessRepository,
    ) { }

    async execute(command: TransportBusinessBrokerSyncCommand): Promise<void> {

        try {
            const business = Business.create(command.data.businessId, command.data.caption, command.data.image);

            await this.businessRepository.upsertBusinesses([business]);

            this.logger.log(`Business ${command.data.businessId} synced successfully`);
        } catch (error) {
            this.logger.error(error);
        }

    }

}