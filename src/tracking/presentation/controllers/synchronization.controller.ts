import { Controller, Post, Logger, UseInterceptors, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";
import { SyncManagementDataCommand, SyncRegisterDevicesCommand } from "src/tracking/application";
import { AuthGuard, AuthorizedPermissions, Permission, ProcessStepsLogger } from "src/common";

@ApiTags('Data Synchronization')
@Controller('sync/jobs')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanelSetting])
export class SynchronizationController {
  private readonly logger = new Logger(SynchronizationController.name);

  constructor(private readonly commandBus: CommandBus) { }

  //#region Management Data Synchronization
  /**
   * Initiate management data synchronization
   * @description Triggers a synchronization job for management data
   */
  @Post('management-data')
  @ApiOperation({
    summary: 'Trigger management data sync',
    description: 'Initiates synchronization process for management data from external systems'
  })
  @ApiResponse({
    status: 202,
    description: 'Sync request accepted and being processed asynchronously'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required'
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - sync already in progress'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during sync initialization'
  })
  async triggerManagementDataSync(): Promise<void> {
    this.logger.log('Initiating management data synchronization');
    await this.commandBus.execute(new SyncManagementDataCommand());
    this.logger.debug('Management data sync command dispatched');
  }
  //#endregion

  //#region Register Devices Synchronization
  /**
   * Initiate register devices synchronization
   * @description Triggers a synchronization job for register devices
   */
  @Post('register-devices')
  @UseInterceptors(ProcessStepsLogger)
  @ApiOperation({
    summary: 'Trigger register devices sync',
    description: 'Initiates synchronization process for register devices from external systems'
  })
  async triggerRegisterDevicesSync(): Promise<void> {
    await this.commandBus.execute(new SyncRegisterDevicesCommand());
  }
  //#endregion
}