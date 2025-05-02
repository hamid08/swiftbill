import { Controller, Get, Put, Logger, Body, Query, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  GetSupportedCommandQuery,
  TrackingDeviceCheckByImeiQuery,
  TrackingDeviceSendCommandCommand,
  TrackingDeviceSendCommandCommandDto
} from "src/tracking/application";
import { TrackingDeviceCheckByImeiResponseDto, TrackingDeviceSupportedCommandDto } from "src/tracking/domain";
import { AuthGuard, AuthorizedPermissions, Permission } from "src/common";

@ApiTags('Tracking Devices')
@Controller('tracking-devices')
@UseGuards(AuthGuard)
export class TrackingDeviceController {
  private readonly logger = new Logger(TrackingDeviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get('check-by-imei')
  @AuthorizedPermissions([Permission.TrackingDevicesManager])
  @ApiOperation({ summary: 'Check by IMEI' })
  @ApiResponse({ status: 200, description: 'Check by IMEI' })
  @ApiQuery({
    name: 'imei',
    required: true,
    description: 'The IMEI number of the device',
    example: '123456789012345',
    type: String,
  })
  async checkByImei(@Query('imei') imei: string): Promise<TrackingDeviceCheckByImeiResponseDto> {
    return await this.queryBus.execute(new TrackingDeviceCheckByImeiQuery(imei));
  }

  @Post('send-command')
  @AuthorizedPermissions([Permission.TrackingPanel])
  @ApiOperation({ summary: 'Send command' })
  @ApiBody({ type: TrackingDeviceSendCommandCommandDto })
  @ApiResponse({ status: 200, description: 'Send command' })
  async sendCommand(@Body() body: TrackingDeviceSendCommandCommandDto): Promise<void> {
    return await this.commandBus.execute(new TrackingDeviceSendCommandCommand(body));
  }

  @Get('supported-commands')
  @AuthorizedPermissions([Permission.TrackingPanel])
  @ApiOperation({ summary: 'Get supported commands' })
  @ApiResponse({ status: 200, description: 'Get supported commands' })
  async getSupportedCommands(@Query('trackerAssignmentId') trackerAssignmentId: number): Promise<TrackingDeviceSupportedCommandDto> {
    return await this.queryBus.execute(new GetSupportedCommandQuery(trackerAssignmentId));
  }
}