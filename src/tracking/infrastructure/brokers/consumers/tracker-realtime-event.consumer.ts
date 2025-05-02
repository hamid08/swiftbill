import { MessageHandlerErrorBehavior, Nack, QueueOptions, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RMQ_CONSTANT, ProcessStepsLogger } from 'src/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { TrackerRealtimeEventCommand, TrackerRealtimeEventCommandModel } from 'src/tracking/application';

@Controller()
export class TrackerRealtimeEventConsumer {
    private readonly logger = new Logger(TrackerRealtimeEventConsumer.name);
    constructor(private readonly commandBus: CommandBus) { }

    @RabbitSubscribe({
        exchange: RMQ_CONSTANT.TRACKER_REALTIME_EVENT.EXCHANGE,
        routingKey: '',
        queue: RMQ_CONSTANT.TRACKER_REALTIME_EVENT.QUEUE,
        queueOptions: {
            durable: false, // Non-durable queue will not survive broker restart
            autoDelete: true, // Queue will be deleted when last consumer unsubscribes
            arguments: {
                'x-message-ttl': 120000, // 2 minutes TTL
                'x-expires': 86400000 // Queue expires after 24h of inactivity
            }
        },
        allowNonJsonMessages: true,
        createQueueIfNotExists: true,
        assertQueueErrorHandler: assertQueueErrorHandler,
        errorHandler: errorHandler,
        errorBehavior: MessageHandlerErrorBehavior.NACK,  // Don't requeue on error
    })

    async handleTrackerRealtimeEvent(
        payload: TrackerRealtimeEventCommandModel[],
    ) {
        try {
            await this.commandBus.execute<TrackerRealtimeEventCommand>(
                new TrackerRealtimeEventCommand(payload),
            );
        } catch (error) {
            return new Nack();

        }

        return new Nack();
    }
}

function assertQueueErrorHandler(channel: Channel, queueName: string, queueOptions: QueueOptions, error: any): string | Promise<string> {
    try {
        console.error(`Queue creation failed (${RMQ_CONSTANT.TRACKER_REALTIME_EVENT.QUEUE}): ${error.message}`, error.stack);
    } catch (error) {

    }
    return;
}

function errorHandler(channel: Channel, msg: ConsumeMessage, error: any): void | Promise<void> {
    try {
        console.error(`Error processing (${RMQ_CONSTANT.TRACKER_REALTIME_EVENT.QUEUE}) message: ${error.message}`, error.stack);
    } catch (error) {

    }
}

