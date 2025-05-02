import { Global, Module } from '@nestjs/common';
import { RabbitMQModule, RabbitMQConfig, MessageHandlerErrorBehavior } from '@golevelup/nestjs-rabbitmq';
import { AppConfigModule, AppConfigService } from 'src/config';
import { RMQ_CONSTANT } from 'src/common/application';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService): RabbitMQConfig => ({
        uri: configService.infrastructure.rabbitMq.uri,
        exchanges: [

          //#region Transport

          //#region Vehicle Sync
          createExchangeConfig(
            RMQ_CONSTANT.TRANSPORT.VEHICLE_SYNC.EXCHANGE,
            'fanout',
            { durable: true },
          ),
          //#endregion

          //#region Business Sync
          createExchangeConfig(
            RMQ_CONSTANT.TRANSPORT.BUSINESS_SYNC.EXCHANGE,
            'fanout',
            { durable: true },
          ),
          //#endregion  

          //#region User Sync
          createExchangeConfig(
            RMQ_CONSTANT.TRANSPORT.USER_SYNC.EXCHANGE,
            'direct',
            { durable: true },
          ),
          //#endregion

          //#endregion


          //#region  Tracking Control
          createExchangeConfig(
            RMQ_CONSTANT.TRACKING_SETTING.SCENARIO.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),

          createExchangeConfig(
            RMQ_CONSTANT.TRACKING_TRIP.CREATION.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

          //#region Tracking Realtime Data
          createExchangeConfig(
            RMQ_CONSTANT.TRACKING_REALTIME_DATA.EXCHANGE,
            'fanout',
            { durable: true },
          ),
          //#endregion

          //#region Sync Management Data
          createExchangeConfig(
            RMQ_CONSTANT.SYNC_MANAGEMENT_DATA.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

          //#region Register Devices  
          createExchangeConfig(
            RMQ_CONSTANT.REGISTER_DEVICES.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

          //#region Command Device
          createExchangeConfig(
            RMQ_CONSTANT.COMMAND_DEVICE.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

          //#region Trace Device Start
          createExchangeConfig(
            RMQ_CONSTANT.TRACE_DEVICE.START.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

          //#region Trace Device Stop
          createExchangeConfig(
            RMQ_CONSTANT.TRACE_DEVICE.STOP.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

          //#region Tracking Extension Activate
          createExchangeConfig(
            RMQ_CONSTANT.TRACKING_EXTENSION.ACTIVATE.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

          //#region Tracking Extension Deactivate
          createExchangeConfig(
            RMQ_CONSTANT.TRACKING_EXTENSION.DEACTIVATE.EXCHANGE,
            'direct',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion

        ],
        queues: [

          //#region Transport

          //#region Vehicle Sync  
          createQueueConfig(
            RMQ_CONSTANT.TRANSPORT.VEHICLE_SYNC.QUEUE,
            RMQ_CONSTANT.TRANSPORT.VEHICLE_SYNC.EXCHANGE,
            '',
            { durable: true, arguments: { 'x-queue-type': 'quorum' } },
          ),

          //#endregion

          //#region Business Sync
          createQueueConfig(
            RMQ_CONSTANT.TRANSPORT.BUSINESS_SYNC.QUEUE,
            RMQ_CONSTANT.TRANSPORT.BUSINESS_SYNC.EXCHANGE,
            '',
            { durable: true, arguments: { 'x-queue-type': 'quorum' } },
          ),

          //#endregion

          //#region User Sync
          createQueueConfig(
            RMQ_CONSTANT.TRANSPORT.USER_SYNC.QUEUE,
            RMQ_CONSTANT.TRANSPORT.USER_SYNC.EXCHANGE,
            '',
            { durable: true, arguments: { 'x-queue-type': 'quorum' } },
          ),
          //#endregion  

          //#endregion

          //#region Tracker Realtime Event
          createQueueConfig(
            RMQ_CONSTANT.TRACKER_REALTIME_EVENT.QUEUE,
            RMQ_CONSTANT.TRACKER_REALTIME_EVENT.EXCHANGE,
            '',
            {
              durable: false, // Non-durable queue will not survive broker restart
              autoDelete: true, // Queue will be deleted when last consumer unsubscribes
              arguments: {
                'x-message-ttl': 120000, // 2 minutes TTL
                'x-expires': 86400000 // Queue expires after 24h of inactivity
              }
            },
          ),
          //#endregion  

          //#region Tracking Realtime Data
          createQueueConfig(
            RMQ_CONSTANT.TRACKING_REALTIME_DATA.QUEUE,
            RMQ_CONSTANT.TRACKING_REALTIME_DATA.EXCHANGE,
            '',
            {
              durable: false, // Non-durable queue will not survive broker restart
              autoDelete: true, // Queue will be deleted when last consumer unsubscribes
              arguments: {
                'x-message-ttl': 120000, // 2 minutes TTL
                'x-expires': 86400000 // Queue expires after 24h of inactivity
              }
            },
          ),
          //#endregion  

          //#region Sync Management Data
          createQueueConfig(
            RMQ_CONSTANT.SYNC_MANAGEMENT_DATA.QUEUE,
            RMQ_CONSTANT.SYNC_MANAGEMENT_DATA.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region Register Devices
          createQueueConfig(
            RMQ_CONSTANT.REGISTER_DEVICES.QUEUE,
            RMQ_CONSTANT.REGISTER_DEVICES.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region Command Device
          createQueueConfig(
            RMQ_CONSTANT.COMMAND_DEVICE.QUEUE,
            RMQ_CONSTANT.COMMAND_DEVICE.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region Trace Device Start
          createQueueConfig(
            RMQ_CONSTANT.TRACE_DEVICE.START.QUEUE,
            RMQ_CONSTANT.TRACE_DEVICE.START.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region Trace Device Stop
          createQueueConfig(
            RMQ_CONSTANT.TRACE_DEVICE.STOP.QUEUE,
            RMQ_CONSTANT.TRACE_DEVICE.STOP.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region Tracking Extension Activate
          createQueueConfig(
            RMQ_CONSTANT.TRACKING_EXTENSION.ACTIVATE.QUEUE,
            RMQ_CONSTANT.TRACKING_EXTENSION.ACTIVATE.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region Tracking Extension Deactivate
          createQueueConfig(
            RMQ_CONSTANT.TRACKING_EXTENSION.DEACTIVATE.QUEUE,
            RMQ_CONSTANT.TRACKING_EXTENSION.DEACTIVATE.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region  Tracking control
          createQueueConfig(
            RMQ_CONSTANT.TRACKING_SETTING.SCENARIO.QUEUE,
            RMQ_CONSTANT.TRACKING_SETTING.SCENARIO.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),
          //#endregion  

          //#region Tracking Trip Creation      
          createQueueConfig(
            RMQ_CONSTANT.TRACKING_TRIP.CREATION.QUEUE,
            RMQ_CONSTANT.TRACKING_TRIP.CREATION.EXCHANGE,
            '',
            {
              durable: true,
              arguments: { 'x-queue-type': 'quorum' },
            },
          ),

          //#endregion

        ],
        defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
        registerHandlers: true,
        connectionInitOptions: { wait: false },
        enableControllerDiscovery: true,
        prefetchCount: 10,
      }),
    }),
  ],
  providers: [],
  exports: [RabbitMQModule],
})
export class RmqModule { }

/**
 * Helper function to create an exchange configuration.
 */
function createExchangeConfig(
  name: string,
  type: 'fanout' | 'direct' | 'topic' | 'headers',
  options: Record<string, unknown>,
) {
  return {
    name,
    createExchangeIfNotExists: true,
    type,
    options,
  };
}

/**
 * Helper function to create a queue configuration.
 */
function createQueueConfig(
  name: string,
  exchange: string,
  routingKey: string,
  options: Record<string, unknown>,
) {
  return {
    name,
    createQueueIfNotExists: true,
    exchange,
    routingKey,
    options,
  };
}
