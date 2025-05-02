import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartTraceDeviceCommand } from './start-trace-device.command';
import { AppException, CACHE_CONSTANTS, RMQ_CONSTANT } from 'src/common';
import { CacheService, ICacheTracker } from '../../../../../services';
import { TrackerError } from 'src/tracking/domain';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@CommandHandler(StartTraceDeviceCommand)
export class StartTraceDeviceCommandHandler implements ICommandHandler<StartTraceDeviceCommand, void> {
    private readonly logger = new Logger(StartTraceDeviceCommandHandler.name);

    constructor(
        @Inject(CacheService)
        private readonly cacheService: CacheService,
        private readonly amqpConnection: AmqpConnection,    
    ) { }

    async execute(command: StartTraceDeviceCommand): Promise<void> {
        const { imei } = command;

        const trackerKey = CACHE_CONSTANTS.KEYS.Tracker(imei);
        const trackerInfo: ICacheTracker | null = await this.cacheService.hGetAll<ICacheTracker>(trackerKey);

        if (!trackerInfo) {
            this.logger.debug(`Tracker ${imei} not found in cache for start trace`);
            throw AppException.NotFound(TrackerError.TraceNotFound);
        }

        await this.amqpConnection.publish(RMQ_CONSTANT.TRACE_DEVICE.START.EXCHANGE, '', command);
        this.logger.log(`🚀 Published start trace request to broker`);

    }
}