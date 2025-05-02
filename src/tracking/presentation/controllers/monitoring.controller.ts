import { Controller, Post, Param, Body, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { DeviceTracingResponse, GetDeviceTracingResultQuery, StartTraceDeviceCommand, StopTraceDeviceCommand } from "src/tracking/application";
import { AuthGuard, AuthorizedPermissions, Permission } from "src/common";
@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingDevicesManager])
export class MonitoringController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus) { }

    //#region Device Tracing

    /**
     * Start tracing for a single device
     * @param imei Device's unique IMEI identifier
     */
    @Post('tracing/devices/:imei/start')
    @ApiOperation({
        summary: 'Start device tracing',
        description: 'Initiates data collection for a specific device'
    })
    @ApiParam({
        name: 'imei',
        description: '15-digit IMEI number',
        example: '490154203237518'
    })
    @ApiResponse({
        status: 202,
        description: 'Trace session successfully initiated'
    })
    async startDeviceTrace(
        @Param('imei') imei: string
    ): Promise<void> {
        await this.commandBus.execute(new StartTraceDeviceCommand(imei));
    }


    /**
     * Stop tracing for a single device
     * @param imei Device's unique IMEI identifier
    */
    @Post('tracing/devices/:imei/stop')
    @ApiOperation({
        summary: 'Stop device tracing',
        description: 'Terminates active trace session for a specific device'
    })
    @ApiParam({
        name: 'imei',
        description: '15-digit IMEI number',
        example: '490154203237518'
    })
    @ApiResponse({
        status: 202,
        description: 'Trace session successfully stopped'
    })
    @ApiParam({
        name: 'imei',
        description: 'Device IMEI number',
        example: '490154203237518'
    })
    async stopDeviceTrace(
        @Param('imei') imei: string
    ): Promise<void> {
        await this.commandBus.execute(new StopTraceDeviceCommand([imei]));
    }

    //#endregion

    //#region Device Tracing Result

    @Get('tracing/devices/:imei/result')
    @ApiOperation({
        summary: 'Get device tracing result',
        description: 'Retrieves the result of a device tracing session'
    })
    @ApiParam({
        name: 'imei',
        description: '15-digit IMEI number',
        example: '490154203237518'
    })
    @ApiResponse({
        status: 200,
        description: 'Device tracing result retrieved successfully'
    })
    async getDeviceTracingResult(
        @Param('imei') imei: string
    ): Promise<DeviceTracingResponse> {
        return await this.queryBus.execute(new GetDeviceTracingResultQuery(imei));
    }

    //#endregion
}