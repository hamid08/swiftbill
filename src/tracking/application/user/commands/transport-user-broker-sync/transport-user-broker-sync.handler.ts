import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User, UserRepository } from 'src/tracking/domain';
import { TransportUserBrokerSyncCommand } from './transport-user-broker-sync.command';

@CommandHandler(TransportUserBrokerSyncCommand)
export class TransportUserBrokerSyncCommandHandler implements ICommandHandler<TransportUserBrokerSyncCommand, void> {
    private readonly logger = new Logger(TransportUserBrokerSyncCommandHandler.name);

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(command: TransportUserBrokerSyncCommand): Promise<void> {

        try {
            const externalId = command.data.id;
            const username = command.data.userName;
            const displayName = `${command.data.firstName} ${command.data.lastName}`;

            const user = User.create({
                externalId,
                username,
                displayName,
                businessExternalIds: command.data.business || [],
            });

            await this.userRepository.upsertUsers([user]);

            this.logger.log(`User ${command.data.id} synced successfully`);
        } catch (error) {
            this.logger.error(error);
        }

    }

}