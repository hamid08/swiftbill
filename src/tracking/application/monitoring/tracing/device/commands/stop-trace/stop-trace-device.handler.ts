import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StopTraceDeviceCommand } from './stop-trace-device.command';
import { CACHE_CONSTANTS, RMQ_CONSTANT } from 'src/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { CacheService } from 'src/tracking/application/services';
@CommandHandler(StopTraceDeviceCommand)
export class StopTraceDeviceCommandHandler implements ICommandHandler<StopTraceDeviceCommand, void> {
    private readonly logger = new Logger(StopTraceDeviceCommandHandler.name);

    constructor(
        private readonly amqpConnection: AmqpConnection,
        @Inject(CacheService)
        private readonly cacheService: CacheService,
    ) { }

    /**
     * Executes the stop trace device command.
     * If the request is from the scheduler, it will get the imei list from the cache.
     * @param command The stop trace device command.
     * @returns void
     */
    async execute(command: StopTraceDeviceCommand): Promise<void> {
        let { imeiList, requestFromScheduler } = command;

        if (requestFromScheduler) {
            const trackersStartedKey = CACHE_CONSTANTS.KEYS.TrackersStartedTracing();
            const trackersStartedTracing: string[] =
                (await this.cacheService.hGetAll(trackersStartedKey)) || [];

            if (trackersStartedTracing && trackersStartedTracing.length > 0) {
                imeiList = trackersStartedTracing;
            }
        }

        if (imeiList && imeiList.length > 0) {
            await this.amqpConnection.publish(RMQ_CONSTANT.TRACE_DEVICE.STOP.EXCHANGE, '', { imeiList });
            this.logger.log(`🚀 Published stop trace request to broker`);
        }

    }
}