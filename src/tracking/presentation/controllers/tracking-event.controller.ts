import { Body, Controller, Get, Logger, Param, Patch, Post, Put, UseInterceptors, Request, Query, ParseArrayPipe, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiQuery } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { TrackingEventAssignmentGridQuery, TrackingEventDetailQuery, TrackingEventGridQuery } from "src/tracking/application";
import { AuthGuard, BaseGridViewDto, GridViewDto, AuthorizedPermissions, Permission, AuthUser, JwtPayload } from "src/common";
import { TrackingEventGridResponseDto, TrackingEventFilterType, TrackingEventDetailResponseDto, TrackingEventAssignmentGridResponseDto } from "src/tracking/domain";

@ApiTags('Tracking Events')
@Controller('tracking-events')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanel])
export class TrackingEventController {
    private readonly logger = new Logger(TrackingEventController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post('grid')
    @ApiOperation({
        summary: 'Get tracking events grid',
        description: 'Returns paginated list of tracking events with filtering and sorting',
    })
    @ApiQuery({
        name: 'filterType',
        enum: TrackingEventFilterType,
        required: false,
        description: 'Type of events to filter by'
    })
    @ApiResponse({ status: 200, description: 'Tracking event list retrieved successfully', type: GridViewDto<TrackingEventGridResponseDto> })
    async grid(@AuthUser() user: JwtPayload, @Body() filter: BaseGridViewDto, @Query('filterType') filterType: TrackingEventFilterType = TrackingEventFilterType.All): Promise<GridViewDto<TrackingEventGridResponseDto>> {
        const businessExternalId = user.business_id;

        return await this.queryBus.execute(new TrackingEventGridQuery(filter, businessExternalId, filterType));
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get tracking event detail',
        description: 'Returns detailed information about a specific tracking event',
    })
    @ApiResponse({ status: 200, description: 'Tracking event detail retrieved successfully', type: TrackingEventDetailResponseDto })
    async detail(@Param('id') id: number): Promise<TrackingEventDetailResponseDto> {
        return await this.queryBus.execute(new TrackingEventDetailQuery(id));
    }

    @Post(':trackerAssignmentId/assignment-grid')
    @ApiOperation({
        summary: 'Get tracking event assignment grid',
        description: 'Returns paginated list of tracking event assignments with filtering and sorting',
    })
    @ApiQuery({
        name: 'fromDate',
        type: Date,
        required: false,
        description: 'Start date of the date range to filter by',
    })
    @ApiQuery({
        name: 'toDate',
        type: Date,
        required: false,
        description: 'End date of the date range to filter by',
    })
    @ApiResponse({ status: 200, description: 'Tracking event assignment grid retrieved successfully', type: GridViewDto<TrackingEventAssignmentGridResponseDto> })
    async assignmentGrid(@Body() filter: BaseGridViewDto, @Param('trackerAssignmentId') trackerAssignmentId: number, @Query('fromDate') fromDate?: Date, @Query('toDate') toDate?: Date):
        Promise<GridViewDto<TrackingEventAssignmentGridResponseDto>> {
        return await this.queryBus.execute(new TrackingEventAssignmentGridQuery(filter, trackerAssignmentId, fromDate, toDate));
    }

}