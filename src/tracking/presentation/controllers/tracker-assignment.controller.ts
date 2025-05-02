import { Controller, Post, Body, Logger, Param, Put, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { EndTrackerAssignmentCommand, TrackerAssignmentCreateCommand, TrackerAssignmentGridQuery, TrackerAssignmentInfoQuery, TrackerAssignmentMobileCommand, TrackerAssignmentMobileResultModel, TrackerAssignmentUpdateCommand, TrackerAssignmentUpdateInfoQuery, GetTrackerAssignmentStatusQuery, GetDataHistoryQuery, GetDataHistoryTrackedRouteQuery, GetTrackerAssignmentSummaryQuery, GetTrackerAssignmentMovementSummaryQuery, GetDataHistoryTrackedParameterQuery } from "src/tracking/application";
import { RelativeTimePeriod, TrackerAssignmentCreateDto, TrackerAssignmentGridResponseDto, TrackerAssignmentInfoDto, TrackerAssignmentMobileDto, TrackerAssignmentMovementSummaryDto, TrackerAssignmentStatusDto, TrackerAssignmentSummaryDto, TrackerAssignmentUpdateDto, TrackerAssignmentUpdateInfo, TrackingDataHistoryDto, TrackingDataHistoryTrackedParameterDto, TrackingDataHistoryTrackedRouteDto } from "src/tracking/domain";
import { GridViewDto, BaseGridViewDto, AuthGuard, AuthorizedPermissions, Permission, ParseDatePipe, AppException, JwtPayload, AuthUser, DateTimeUtils } from "src/common";

@ApiTags('Tracker Assignment')
@Controller('tracker-assignment')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanel])
export class TrackerAssignmentController {
    private readonly logger = new Logger(TrackerAssignmentController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    //#region Mobile Forced Tracker Assignment
    @Post('mobile')
    @AuthorizedPermissions([Permission.TrackingDevicesManager])
    @ApiOperation({ summary: 'Assign Mobile Forced Trackers' })
    @ApiResponse({
        status: 200,
        description: 'Mobile Forced Tracker assignments processed successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request'
    })
    async mobile(
        @AuthUser() user: JwtPayload,
        @Body() dto: TrackerAssignmentMobileDto
    ): Promise<TrackerAssignmentMobileResultModel> {
        const businessExternalId = user.business_id;
        return await this.commandBus.execute(
            new TrackerAssignmentMobileCommand(businessExternalId, dto)
        );
    }
    //#endregion

    //#region Grid
    @Post('grid')
    @AuthorizedPermissions([Permission.TrackingDevicesManager])
    @ApiOperation({ summary: 'Get Tracker Assignment Grid' })
    @ApiResponse({ status: 200, description: 'Tracker Assignment Grid retrieved successfully' })
    async grid(
        @AuthUser() user: JwtPayload,
        @Body() filter: BaseGridViewDto
    ): Promise<GridViewDto<TrackerAssignmentGridResponseDto>> {
        const businessExternalId = user.business_id;
        return await this.queryBus.execute(new TrackerAssignmentGridQuery(filter, businessExternalId));
    }
    //#endregion

    //#region EndAssignment
    @Put(':trackerAssignmentId/end-assignment')
    @AuthorizedPermissions([Permission.TrackingDevicesManager])
    @ApiOperation({ summary: 'End Tracker Assignment' })
    @ApiResponse({
        status: 200,
        description: 'Tracker Assignment ended successfully'
    })
    @ApiResponse({ status: 404, description: 'Assignment not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    async endAssignment(@Param('trackerAssignmentId') trackerAssignmentId: number): Promise<void> {
        return await this.commandBus.execute(new EndTrackerAssignmentCommand(trackerAssignmentId));
    }
    //#endregion

    //#region  Create TrackerAssignment
    @Post()
    @AuthorizedPermissions([Permission.TrackingDevicesManager])
    @ApiOperation({ summary: 'Create Tracker Assignment' })
    @ApiResponse({
        status: 200,
        description: 'Tracker Assignment Created successfully'
    })
    @ApiBody({ type: TrackerAssignmentCreateDto })
    async createTrackerAssignment(
        @Body() createDto: TrackerAssignmentCreateDto
    ): Promise<void> {
        return await this.commandBus.execute(new TrackerAssignmentCreateCommand(createDto));
    }

    //#endregion

    //#region Tracker Assignment Update
    @Put(':trackerAssignmentId')
    @AuthorizedPermissions([Permission.TrackingDevicesManager])
    @ApiOperation({
        summary: 'Update Tracker Assignment',
        description: 'Updates an existing tracker assignment with new device information'
    })
    @ApiResponse({
        status: 200,
        description: 'Tracker assignment updated successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid input or assignment cannot be updated'
    })
    @ApiResponse({
        status: 404,
        description: 'Tracker assignment not found'
    })
    @ApiBody({
        type: TrackerAssignmentUpdateDto,
        description: 'Tracker assignment update data including device information'
    })
    async updateTrackerAssignment(
        @Param('trackerAssignmentId') trackerAssignmentId: number,
        @Body() updateDto: TrackerAssignmentUpdateDto
    ): Promise<void> {
        await this.commandBus.execute(
            new TrackerAssignmentUpdateCommand(trackerAssignmentId, updateDto)
        );
    }
    //#endregion

    //#region Tracker Assignment Update Info
    @Get(':trackerAssignmentId')
    @AuthorizedPermissions([Permission.TrackingDevicesManager])
    @ApiOperation({
        summary: 'Get UpdateInfo Tracker Assignment',
    })
    async getUpdateInfoTrackerAssignment(
        @Param('trackerAssignmentId') trackerAssignmentId: number,
    ): Promise<TrackerAssignmentUpdateInfo> {
        return await this.queryBus.execute(
            new TrackerAssignmentUpdateInfoQuery(trackerAssignmentId)
        );
    }
    //#endregion

    //#region Tracker Assignment Info
    @Get(':trackerAssignmentId/info')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({
        summary: 'Get Tracker Assignment Info',
    })
    async getTrackerAssignmentInfo(@Param('trackerAssignmentId') trackerAssignmentId: number): Promise<TrackerAssignmentInfoDto> {
        return await this.queryBus.execute(new TrackerAssignmentInfoQuery(trackerAssignmentId));
    }
    //#endregion

    //#region Tracker Assignment Status
    @Get(':trackerAssignmentId/status')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({
        summary: 'Get Tracker Assignment Status',
    })
    @ApiQuery({ name: 'fetchAllIoParameters', type: Boolean, required: false })
    async getTrackerAssignmentStatus(@Param('trackerAssignmentId') trackerAssignmentId: number, @Query('fetchAllIoParameters') fetchAllIoParameters: boolean = false):
        Promise<TrackerAssignmentStatusDto> {
        return await this.queryBus.execute(new GetTrackerAssignmentStatusQuery(trackerAssignmentId, fetchAllIoParameters));
    }
    //#endregion

    //#region Tracker Assignment Data History
    @Post(':trackerAssignmentId/data-history')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({ summary: 'Get Tracker Assignment Data History' })
    @ApiQuery({ name: 'fromDate', type: Date, required: false })
    @ApiQuery({ name: 'toDate', type: Date, required: false })
    @ApiQuery({
        name: 'fromTime',
        type: String,
        required: false,
        description: 'Start time in HH:mm format (e.g., "08:30")'
    })
    @ApiQuery({
        name: 'toTime',
        type: String,
        required: false,
        description: 'End time in HH:mm format (e.g., "17:45")'
    })
    async getDataHistory(
        @Param('trackerAssignmentId') trackerAssignmentId: number,
        @Query('fromDate', new ParseDatePipe()) fromDate?: Date,
        @Query('toDate', new ParseDatePipe()) toDate?: Date,
        @Query('fromTime') fromTime?: string,
        @Query('toTime') toTime?: string
    ): Promise<GridViewDto<TrackingDataHistoryDto>> {

        // Validate time format if provided
        if (fromTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(fromTime)) {
            throw AppException.BadRequest('Invalid fromTime format. Use HH:mm');
        }
        if (toTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(toTime)) {
            throw AppException.BadRequest('Invalid toTime format. Use HH:mm');
        }

        const { effectiveFromDate, effectiveToDate } = DateTimeUtils.getDateRange({
            fromDate,
            toDate,
            defaultDays: 7
        });

        return await this.queryBus.execute(
            new GetDataHistoryQuery(
                trackerAssignmentId,
                effectiveFromDate,
                effectiveToDate,
                fromTime,
                toTime
            )
        );
    }
    //#endregion

    //#region Tracker Assignment Data History Tracked Route
    @Get(':trackerAssignmentId/data-history/tracked-route')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({
        summary: 'Get detailed tracked route points for a specific time period',
        description: 'Returns all tracking points between the specified dates/times'
    })
    @ApiQuery({
        name: 'fromDate',
        type: Date,
        required: false,
        description: 'Start date of the period'
    })
    @ApiQuery({
        name: 'toDate',
        type: Date,
        required: false,
        description: 'End date of the period'
    })
    async getDataHistoryTrackedRoute(
        @Param('trackerAssignmentId') trackerAssignmentId: number,
        @Query('fromDate', new ParseDatePipe()) fromDate?: Date,
        @Query('toDate', new ParseDatePipe()) toDate?: Date,
    ): Promise<TrackingDataHistoryTrackedRouteDto> {

        // Create precise date range based on time parameters
        let effectiveFromDate = new Date(fromDate);
        let effectiveToDate = new Date(toDate);

        return await this.queryBus.execute(
            new GetDataHistoryTrackedRouteQuery(trackerAssignmentId, effectiveFromDate, effectiveToDate)
        );
    }
    //#endregion

    //#region Tracker Assignment Data History Tracked Route
    @Get(':trackerAssignmentId/data-history/tracked-parameter')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({
        summary: 'Get detailed tracked parameter points for a specific time period',
    })
    @ApiQuery({
        name: 'parameterKey',
        type: String,
        required: true,
        description: 'Io parameterKey'
    })
    @ApiQuery({
        name: 'fromDate',
        type: Date,
        required: false,
        description: 'Start date of the period'
    })
    @ApiQuery({
        name: 'toDate',
        type: Date,
        required: false,
        description: 'End date of the period'
    })
    async getDataHistoryTrackedParameter(
        @Param('trackerAssignmentId') trackerAssignmentId: number,
        @Query('parameterKey') parameterKey: string,
        @Query('fromDate', new ParseDatePipe()) fromDate?: Date,
        @Query('toDate', new ParseDatePipe()) toDate?: Date,
    ): Promise<TrackingDataHistoryTrackedParameterDto> {

        // Create precise date range based on time parameters
        let effectiveFromDate = new Date(fromDate);
        let effectiveToDate = new Date(toDate);

        return await this.queryBus.execute(
            new GetDataHistoryTrackedParameterQuery(trackerAssignmentId, parameterKey, effectiveFromDate, effectiveToDate)
        );
    }
    //#endregion



    //#region Tracker Assignment Summary
    @Get(':trackerAssignmentId/summary')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({
        summary: 'Get Tracker Assignment Summary',
    })
    @ApiQuery({
        name: 'period',
        enum: RelativeTimePeriod,
        required: false,
        description: 'RelativeTimePeriod'
    })
    async getTrackerAssignmentSummary(
        @Param('trackerAssignmentId') trackerAssignmentId: number,
        @Query('period') period: RelativeTimePeriod = RelativeTimePeriod.Today,
    ):
        Promise<TrackerAssignmentSummaryDto> {
        return await this.queryBus.execute(new GetTrackerAssignmentSummaryQuery(trackerAssignmentId, period));
    }
    //#endregion

    //#region Tracker Assignment Summary
    @Get(':trackerAssignmentId/movement-summary')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({
        summary: 'Get Tracker Assignment Movement Summary',
    })
    @ApiQuery({
        name: 'hours',
        type: Number,
        required: false,
        description: 'hours'
    })
    async getTrackerAssignmentMovementSummary(
        @Param('trackerAssignmentId') trackerAssignmentId: number,
        @Query('hours') hours: number = 1,
    ):
        Promise<TrackerAssignmentMovementSummaryDto> {
        return await this.queryBus.execute(new GetTrackerAssignmentMovementSummaryQuery(trackerAssignmentId, hours));
    }
    //#endregion

}