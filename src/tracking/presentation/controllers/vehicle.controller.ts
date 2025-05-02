import { Body, Controller, Get, Logger, Post, Put, UseInterceptors, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
    VehicleListQuery,
    VehicleSyncCommand,
} from "src/tracking/application";
import { ProcessStepsLogger, BaseGridViewDto, GridViewDto, SelectItemDto, SelectItemFilter, Permission, AuthGuard, AuthorizedPermissions, JwtPayload, AuthUser } from "src/common";
import { VehicleAssignmentMobileGridResponseDto } from "src/tracking/domain";
import { VehicleAssignmentMobileGridQuery } from "src/tracking/application";

// @ApiBearerAuth()
@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(AuthGuard)
export class VehicleController {
    private readonly logger = new Logger(VehicleController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    //#region Vehicle Synchronization
    @Post('synchronization')
    @AuthorizedPermissions([Permission.TrackingPanelSetting])
    @UseInterceptors(ProcessStepsLogger)
    @ApiOperation({
        summary: 'Synchronize vehicle data',
        description: 'Synchronizes vehicle information with external systems'
    })
    @ApiResponse({
        status: 202,
        description: 'Vehicle synchronization initiated successfully'
    })
    @ApiResponse({
        status: 429,
        description: 'Synchronization already in progress'
    })
    async synchronizeVehicles(): Promise<void> {
        await await this.commandBus.execute(new VehicleSyncCommand());
    }
    //#endregion


    //#region Vehicles Mobile Grid
    @Post('mobile-grid')
    @AuthorizedPermissions([Permission.TrackingDevicesManager])
    @ApiOperation({
        summary: 'Get vehicles for mobile assignment grid',
        description: 'Retrieves a paginated list of vehicles for mobile assignment grid',
    })
    @ApiResponse({ status: 200, description: 'Successfully retrieved vehicles for mobile assignment grid' })
    async getVehiclesMobileGrid(@AuthUser() user: JwtPayload, @Body() filter: BaseGridViewDto,
    ): Promise<GridViewDto<VehicleAssignmentMobileGridResponseDto>> {
        const businessExternalId = user.business_id;
        return await this.queryBus.execute(new VehicleAssignmentMobileGridQuery(filter, businessExternalId));
    }
    //#endregion

    //#region  Get List

    @Get('list')
    @ApiOperation({
        summary: 'Get vehicles list',
        description: 'Retrieves all current vehicles list'
    })
    @ApiResponse({
        status: 200,
        description: 'Vehicles successfully retrieved',
    })
    async getVehiclesList(@AuthUser() user: JwtPayload, @Query() filter: SelectItemFilter): Promise<SelectItemDto[]> {
        const businessExternalId = user.business_id;

        return await this.queryBus.execute(
            new VehicleListQuery(filter, businessExternalId)
        );
    }

    //#endregion

}