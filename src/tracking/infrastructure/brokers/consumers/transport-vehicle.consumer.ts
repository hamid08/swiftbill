import { MessageHandlerErrorBehavior, Nack, QueueOptions, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessStepsLogger, RMQ_CONSTANT } from 'src/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { TransportVehicleBrokerSyncCommand, TransportVehicleBrokerSyncModel } from 'src/tracking/application';
@Controller()
export class TransportVehicleBrokerSyncConsumer {
    private readonly logger = new Logger(TransportVehicleBrokerSyncConsumer.name);
    constructor(private readonly commandBus: CommandBus) { }

    @RabbitSubscribe({
        exchange: RMQ_CONSTANT.TRANSPORT.VEHICLE_SYNC.EXCHANGE,
        routingKey: '',
        queue: RMQ_CONSTANT.TRANSPORT.VEHICLE_SYNC.QUEUE,
        queueOptions: {
            durable: true,
            arguments: { 'x-queue-type': 'quorum' }
        },
        allowNonJsonMessages: true,
        createQueueIfNotExists: true,
        assertQueueErrorHandler: assertQueueErrorHandler,
        errorHandler: errorHandler,
        errorBehavior: MessageHandlerErrorBehavior.REQUEUE
    })

    @UseInterceptors(ProcessStepsLogger)
    async handleVehicleSync(
        payload: TransportVehicleBrokerSyncModel,
    ) {
        try {
            await this.commandBus.execute<TransportVehicleBrokerSyncCommand>(
                new TransportVehicleBrokerSyncCommand(payload),
            );
        } catch (error) {
        }

        return new Nack();
    }
}

function assertQueueErrorHandler(channel: Channel, queueName: string, queueOptions: QueueOptions, error: any): string | Promise<string> {
    try {
        console.error(`Queue creation failed (${RMQ_CONSTANT.TRANSPORT.VEHICLE_SYNC.QUEUE}): ${error.message}`, error.stack);
    } catch (error) {

    }
    return;
}

function errorHandler(channel: Channel, msg: ConsumeMessage, error: any): void | Promise<void> {
    try {
        console.error(`Error processing (${RMQ_CONSTANT.TRACKING_TRIP.CREATION.QUEUE}) message: ${error.message}`, error.stack);
    } catch (error) {

    }
}

