import { MessageHandlerErrorBehavior, Nack, QueueOptions, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, Logger, UseInterceptors } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessStepsLogger, RMQ_CONSTANT } from 'src/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { ScenarioSettingCommand, ScenarioSettingCommandModel } from 'src/tracking/application';

@Controller()
export class ScenarioSettingConsumer {
    private readonly logger = new Logger(ScenarioSettingConsumer.name);
    constructor(private readonly commandBus: CommandBus) { }

    @RabbitSubscribe({
        exchange: RMQ_CONSTANT.TRACKING_SETTING.SCENARIO.EXCHANGE,
        routingKey: '',
        queue: RMQ_CONSTANT.TRACKING_SETTING.SCENARIO.QUEUE,
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
    async handleScenarioSetting(
        payload: ScenarioSettingCommandModel,
    ) {
        try {
            await this.commandBus.execute<ScenarioSettingCommand>(
                new ScenarioSettingCommand(payload),
            );
        } catch (error) {
        }

        return new Nack();
    }
}

function assertQueueErrorHandler(channel: Channel, queueName: string, queueOptions: QueueOptions, error: any): string | Promise<string> {
    try {
        console.error(`Queue creation failed (${RMQ_CONSTANT.TRACKING_SETTING.SCENARIO.QUEUE}): ${error.message}`, error.stack);
    } catch (error) {

    }
    return;
}

function errorHandler(channel: Channel, msg: ConsumeMessage, error: any): void | Promise<void> {
    try {
        console.error(`Error processing (${RMQ_CONSTANT.TRACKING_SETTING.SCENARIO.QUEUE}) message: ${error.message}`, error.stack);
    } catch (error) {

    }
}

