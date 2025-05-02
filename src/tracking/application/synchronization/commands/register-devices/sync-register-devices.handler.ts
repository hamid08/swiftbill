import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RMQ_CONSTANT } from 'src/common';
import { SyncRegisterDevicesCommand } from './sync-register-devices.command';
import {
  TrackerAssignmentDevicesRegisterationDto,
  TrackerAssignmentRepository
} from 'src/tracking/domain';

@CommandHandler(SyncRegisterDevicesCommand)
export class SyncRegisterDevicesCommandHandler
  implements ICommandHandler<SyncRegisterDevicesCommand, void> {

  private readonly logger = new Logger(SyncRegisterDevicesCommandHandler.name);
  private static readonly PAGE_SIZE = 1000;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    @Inject(TrackerAssignmentRepository)
    private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
  ) { }

  async execute(command: SyncRegisterDevicesCommand): Promise<void> {
    const totalDevices = await this.publishAllDeviceRegistrations();
    this.logger.log(`✅ Successfully Sent synced request ${totalDevices} devices`);
  }

  private async publishAllDeviceRegistrations(): Promise<number> {
    let pageIndex = 1;
    let hasMoreDevices = true;
    let totalDevices = 0;

    while (hasMoreDevices) {
      const devices = await this.getDevicesBatch(pageIndex);

      if (devices.length === 0) {
        hasMoreDevices = false;
        this.logger.debug(`No more devices found at page ${pageIndex}`);
        continue;
      }

      await this.publishToBroker(devices, pageIndex);
      totalDevices += devices.length;
      pageIndex++;
    }

    return totalDevices;
  }

  private async getDevicesBatch(pageIndex: number):
    Promise<TrackerAssignmentDevicesRegisterationDto[]> {
    this.logger.debug(`Fetching devices batch for page ${pageIndex}`);
    return this.trackerAssignmentRepository.getActiveDevicesForRegisteration(
      pageIndex,
      SyncRegisterDevicesCommandHandler.PAGE_SIZE
    );
  }

  private async publishToBroker(
    devices: TrackerAssignmentDevicesRegisterationDto[],
    pageIndex: number
  ): Promise<void> {
    await this.amqpConnection.publish(
      RMQ_CONSTANT.REGISTER_DEVICES.EXCHANGE,
      '',
      devices
    );

    this.logger.log(
      `🚀 Published ${devices.length} devices to broker in page ${pageIndex}`
    );
  }
}