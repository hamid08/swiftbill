import { Body, Controller, Get, Logger, Param, Patch, Post, Put, UseInterceptors, Request, Query, ParseArrayPipe, Delete, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiQuery } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
    UserGridQuery,
    UserSyncCommand,
    UpdateUserVehicleAccessCommand,
    UserAssignVehiclesGridQuery,
    UserUnassignVehiclesGridQuery,
    UserAssignVehiclesCommand,
    UserUnassignVehiclesCommand
} from "src/tracking/application";
import { AuthGuard, AuthorizedPermissions, AuthUser, BaseGridViewDto, GridViewDto, JwtPayload, Permission, ProcessStepsLogger } from "src/common";
import { UserGridResponseDto, VehiclesUserGridResponseDto } from "src/tracking/domain";

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    //#region User Synchronization
    @Post('synchronization')
    @AuthorizedPermissions([Permission.TrackingPanelSetting])
    @UseInterceptors(ProcessStepsLogger)
    @ApiOperation({
        summary: 'Synchronize users',
        description: 'Synchronizes user data with external identity provider'
    })
    @ApiResponse({
        status: 202,
        description: 'User synchronization initiated'
    })
    @ApiResponse({
        status: 429,
        description: 'Synchronization already in progress'
    })
    async synchronize(): Promise<void> {
        await this.commandBus.execute(new UserSyncCommand());
    }
    //#endregion

    //#region User Management
    @Post('grid')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiOperation({
        summary: 'Get users grid',
        description: 'Returns paginated list of users with filtering and sorting',
    })
    @ApiResponse({ status: 200, description: 'User list retrieved successfully', type: GridViewDto<UserGridResponseDto> })
    async usersGrid(@AuthUser() user: JwtPayload, @Body() filter: BaseGridViewDto): Promise<GridViewDto<UserGridResponseDto>> {
        const businessExternalId = user.business_id;
        return await this.queryBus.execute(new UserGridQuery(filter, businessExternalId));
    }
    //#endregion

    //#region Vehicle Access Management
    @Patch(':userId/vehicle-access/active')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiOperation({
        summary: 'Activate global vehicle access',
        description: 'Gives user permission to access ALL vehicles in the system'
    })
    @ApiResponse({ status: 200, description: 'Vehicle access granted successfully.' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async grantVehicleAccess(@Param('userId') userId: number): Promise<void> {
        return await this.commandBus.execute(new UpdateUserVehicleAccessCommand(userId, true));
    }

    @Patch(':userId/vehicle-access/inactive')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiOperation({
        summary: 'Deactivate global vehicle access',
        description: 'Removes user permission to access ALL vehicles in the system'
    })
    @ApiResponse({ status: 200, description: 'Vehicle access revoked successfully.' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async revokeVehicleAccess(@Param('userId') userId: number): Promise<void> {
        return await this.commandBus.execute(new UpdateUserVehicleAccessCommand(userId, false));
    }
    //#endregion

    //#region Vehicle Assignment Grid
    @Post(':userId/vehicles/assignable/grid')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiOperation({
        summary: 'Get vehicles available for assignment',
        description: 'Returns paginated list of vehicles that can be assigned to the user, with grid filtering options'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully returned assignable vehicles grid',
        type: GridViewDto<VehiclesUserGridResponseDto>
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async assignableVehiclesGrid(
        @AuthUser() user: JwtPayload,
        @Param('userId') userId: number,
        @Body() filter: BaseGridViewDto,
    ): Promise<GridViewDto<VehiclesUserGridResponseDto>> {
        const businessExternalId = user.business_id;
        return await this.queryBus.execute(
            new UserUnassignVehiclesGridQuery(filter, userId, businessExternalId)
        );
    }

    @Post(':userId/vehicles/assigned/grid')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiOperation({
        summary: 'Get currently assigned vehicles',
        description: 'Returns paginated list of vehicles already assigned to the user, with grid filtering options'
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully returned assigned vehicles grid',
        type: GridViewDto<VehiclesUserGridResponseDto>
    })
    @ApiResponse({ status: 400, description: 'Invalid request parameters' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async assignedVehiclesGrid(
        @AuthUser() user: JwtPayload,
        @Param('userId') userId: number,
        @Body() filter: BaseGridViewDto,
    ): Promise<GridViewDto<VehiclesUserGridResponseDto>> {
        const businessExternalId = user.business_id;
        return await this.queryBus.execute(
            new UserAssignVehiclesGridQuery(filter, userId, businessExternalId)
        );
    }
    //#endregion

    //#region Vehicle Assignment
    @Post(':userId/vehicles/assign')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiQuery({
        name: 'vehicleIds',
        type: [Number],
        description: 'Array of vehicle IDs to assign',
        required: true,
        example: [1, 2, 3]
    })
    @ApiOperation({
        summary: 'Assign vehicles to user',
        description: 'Assigns multiple vehicles to a user using query parameters'
    })
    @ApiResponse({ status: 200, description: 'Vehicles assigned successfully' })
    @ApiResponse({ status: 400, description: 'Invalid vehicle IDs provided' })
    @ApiResponse({ status: 404, description: 'User or vehicles not found' })
    async assignVehicles(
        @Param('userId') userId: number,
        @Query('vehicleIds', new ParseArrayPipe({
            items: Number,
            //separator: ',', // Remove this line for multiple params style
            optional: false
        }))
        vehicleIds: number[]
    ): Promise<void> {
        return await this.commandBus.execute(new UserAssignVehiclesCommand(userId, vehicleIds));
    }

    @Delete(':userId/vehicles/unassign')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiQuery({
        name: 'vehicleIds',
        type: [Number],
        description: 'Array of vehicle IDs to unassign',
        required: true,
        example: [1, 2, 3]
    })
    @ApiOperation({
        summary: 'Unassign vehicles from user',
        description: 'Unassigns multiple vehicles from a user using query parameters'
    })
    @ApiResponse({ status: 200, description: 'Vehicles unassigned successfully' })
    @ApiResponse({ status: 400, description: 'Invalid vehicle IDs provided' })
    @ApiResponse({ status: 404, description: 'User or vehicles not found' })
    async unassignVehicles(
        @Param('userId') userId: number,
        @Query('vehicleIds', new ParseArrayPipe({
            items: Number,
            //separator: ',', // Remove this line for multiple params style
            optional: false
        }))
        vehicleIds: number[]
    ): Promise<void> {
        return await this.commandBus.execute(new UserUnassignVehiclesCommand(userId, vehicleIds));
    }

    @Delete(':userId/vehicles/unassign/:vehicleId')
    @AuthorizedPermissions([Permission.TrackingUserAccessManagement])
    @ApiOperation({
        summary: 'Unassign vehicle from user',
        description: 'Unassigns a vehicle from a user using path parameters'
    })
    @ApiResponse({ status: 200, description: 'Vehicle unassigned successfully' })
    async unassignVehicle(
        @Param('userId') userId: number,
        @Param('vehicleId') vehicleId: number
    ): Promise<void> {
        return await this.commandBus.execute(new UserUnassignVehiclesCommand(userId, [vehicleId]));
    }
    //#endregion    


}