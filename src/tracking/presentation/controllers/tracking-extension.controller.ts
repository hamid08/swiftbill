import { Body, Controller, Get, Logger, Param, Patch, Post, Put, UseInterceptors, Request, Query, ParseArrayPipe, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import { AuthorizedPermissions, AuthGuard, BaseGridViewDto, GridViewDto, Permission, } from "src/common";
import { TrackingExtensionCreateDomainDto, TrackingExtensionGridResponseDto, TrackingExtensionStatus, TrackingExtensionUpdateDomainDto, TrackingExtensionMinimalInfoDto, MinimalLocationB1 } from "src/tracking/domain";
import { GetTrackingExtensionByIdQuery, GetTrackingExtensionByExtensionIdQuery, TrackingExtensionChangeStatusCommand, TrackingExtensionCreateCommand, TrackingExtensionGridQuery, TrackingExtensionUpdateCommand, GetExtensionLatestLocationQuery } from "src/tracking/application";

@ApiTags('Tracking Extensions')
@Controller('tracking-extensions')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingDevicesManager])
export class TrackingExtensionController {
    private readonly logger = new Logger(TrackingExtensionController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }



    //#region Tracking Extension Management
    @Post(':trackerAssignmentId/grid')
    @ApiOperation({
        summary: 'Get tracking extensions grid',
        description: 'Returns paginated list of tracking extensions with filtering and sorting',
    })
    @ApiResponse({ status: 200, description: 'Tracking extension list retrieved successfully', type: GridViewDto<TrackingExtensionGridResponseDto> })
    async trackingExtensionsGrid(@Body() filter: BaseGridViewDto, @Param('trackerAssignmentId') trackerAssignmentId: number): Promise<GridViewDto<TrackingExtensionGridResponseDto>> {
        return await this.queryBus.execute(new TrackingExtensionGridQuery(filter, trackerAssignmentId));
    }
    //#endregion

    //#region Create Tracking Extension 
    @Post(':trackerAssignmentId/create')
    @ApiOperation({
        summary: 'Create a new tracking extension',
        description: 'Creates a new tracking extension for a specific tracking device',
    })
    @ApiResponse({ status: 201, description: 'Tracking extension created successfully' })
    async createTrackingExtension(@Body() createTrackingExtensionDto: TrackingExtensionCreateDomainDto, @Param('trackerAssignmentId') trackerAssignmentId: number): Promise<void> {
        return await this.commandBus.execute(new TrackingExtensionCreateCommand(trackerAssignmentId, createTrackingExtensionDto));
    }
    //#endregion

    //#region Update Tracking Extension 
    @Put(':trackerAssignmentId/update/:trackingExtensionId')
    @ApiOperation({
        summary: 'Update a tracking extension',
        description: 'Updates a tracking extension for a specific tracking device',
    })
    @ApiResponse({ status: 200, description: 'Tracking extension updated successfully' })
    async updateTrackingExtension(@Body() updateTrackingExtensionDto: TrackingExtensionUpdateDomainDto,
        @Param('trackerAssignmentId') trackerAssignmentId: number, @Param('trackingExtensionId') trackingExtensionId: number): Promise<void> {
        return await this.commandBus.execute(new TrackingExtensionUpdateCommand(trackerAssignmentId, trackingExtensionId, updateTrackingExtensionDto));
    }
    //#endregion

    //#region Get Tracking Extension By Id

    @Get(':trackingExtensionId')
    @ApiOperation({
        summary: 'Get a tracking extension by id',
        description: 'Returns a tracking extension by id',
    })
    async getTrackingExtensionById(@Param('trackingExtensionId') trackingExtensionId: number): Promise<TrackingExtensionMinimalInfoDto> {
        return await this.queryBus.execute(new GetTrackingExtensionByIdQuery(trackingExtensionId));
    }
    //#endregion

    //#region Get Tracking Extension By Extension Id
    @Get('extension-id/:extensionId')
    @ApiOperation({
        summary: 'Get a tracking extension by extension id',
        description: 'Returns a tracking extension by extension id',
    })
    async getTrackingExtensionByExtensionId(@Param('extensionId') extensionId: string): Promise<TrackingExtensionMinimalInfoDto> {
        return await this.queryBus.execute(new GetTrackingExtensionByExtensionIdQuery(extensionId));
    }
    //#endregion

    //#region Tracking Extension Status Management
    @Post(':trackerAssignmentId/activation/:trackingExtensionId')
    @ApiOperation({
        summary: 'Activate tracking extension',
        description: 'Activate tracking extension',
    })
    async activateTrackingExtension(@Param('trackerAssignmentId') trackerAssignmentId: number, @Param('trackingExtensionId') trackingExtensionId: number): Promise<void> {
        return await this.commandBus.execute(new TrackingExtensionChangeStatusCommand(trackerAssignmentId, trackingExtensionId, TrackingExtensionStatus.Activating));
    }

    @Post(':trackerAssignmentId/deactivation/:trackingExtensionId')
    @ApiOperation({
        summary: 'Deactivate tracking extension',
        description: 'Deactivate tracking extension',
    })
    async deactivateTrackingExtension(@Param('trackerAssignmentId') trackerAssignmentId: number, @Param('trackingExtensionId') trackingExtensionId: number): Promise<void> {
        return await this.commandBus.execute(new TrackingExtensionChangeStatusCommand(trackerAssignmentId, trackingExtensionId, TrackingExtensionStatus.Deactivating));
    }

    @Post(':trackerAssignmentId/activate-and-send-request/:trackingExtensionId')
    @ApiOperation({
        summary: 'Activate tracking extension and send request',
        description: 'Activate tracking extension and send request',
    })
    async activateTrackingExtensionAndSendRequest(@Param('trackerAssignmentId') trackerAssignmentId: number, @Param('trackingExtensionId') trackingExtensionId: number): Promise<void> {
        return await this.commandBus.execute(new TrackingExtensionChangeStatusCommand(trackerAssignmentId, trackingExtensionId, TrackingExtensionStatus.Active));
    }
    //#endregion

    //#region Get Extension Latest Location
    @Get(':trackerAssignmentId/:trackingExtensionId/latest-location')
    @ApiOperation({
        summary: 'Get extension latest location',
        description: 'Get extension latest location',
    })
    async getExtensionLatestLocation(@Param('trackerAssignmentId') trackerAssignmentId: number, @Param('trackingExtensionId') trackingExtensionId: number): Promise<MinimalLocationB1> {
        return await this.queryBus.execute(new GetExtensionLatestLocationQuery(trackerAssignmentId, trackingExtensionId));
    }
    //#endregion

}