import { Controller, Get, Put, Logger, Body, Query, Param, Post, ParseIntPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CurrentDriverDto, GetCurrentDriverQuery, GetTrackerAssignmentListQuery, GetTrackerSummaryStatusQuery, TrackerGridQuery } from "src/tracking/application";
import { TrackerGridResponseDto, TrackerSummaryStatusDto } from "src/tracking/domain";
import { TrackerAssignmentListItemDto, TrackerCategoryViewMode, TrackerStatusFilter } from "src/tracking";
import { BaseGridViewDto, GridViewDto, AuthorizedPermissions, Permission, JwtPayload, AuthUser, AuthGuard } from "src/common";

@ApiTags('Trackers')
@Controller('trackers')
@UseGuards(AuthGuard)
export class TrackerController {
    private readonly logger = new Logger(TrackerController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Get(':trackerId/current-driver')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({ summary: 'Get current driver' })
    @ApiResponse({ status: 200, description: 'Current driver' })
    async getCurrentDriver(@AuthUser() user: JwtPayload, @Param('trackerId') trackerId: number): Promise<CurrentDriverDto | null> {
        return await this.queryBus.execute(new GetCurrentDriverQuery(trackerId));
    }

    @Post('grid')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({
        summary: 'Get trackers grid',
        description: 'Returns paginated list of trackers with filtering and sorting. If trackerId is provided, ensures that tracker is included in results.',
    })
    @ApiQuery({
        name: 'statusFilter',
        enum: TrackerStatusFilter,
        required: false,
        description: 'Status filter'
    })
    @ApiQuery({
        name: 'categoryViewMode',
        enum: TrackerCategoryViewMode,
        required: true,
        description: 'Category view mode'
    })
    @ApiQuery({
        name: 'trackerId',
        type: Number,
        required: false,
        description: 'Optional tracker ID to ensure inclusion in results'
    })
    @ApiResponse({
        status: 200,
        description: 'Tracking event list retrieved successfully',
        type: GridViewDto<TrackerGridResponseDto>
    })
    async grid(
        @AuthUser() user: JwtPayload,
        @Body() filter: BaseGridViewDto,
        @Query('statusFilter') statusFilter: TrackerStatusFilter = TrackerStatusFilter.ALL,
        @Query('categoryViewMode') categoryViewMode: TrackerCategoryViewMode = TrackerCategoryViewMode.CURRENT,
        @Query('selectedObject') trackerId?: number
    ): Promise<GridViewDto<TrackerGridResponseDto>> {
        const businessExternalId = user.business_id;
        const userExternalId = user.sub;
        return await this.queryBus.execute(
            new TrackerGridQuery(userExternalId, filter, businessExternalId, statusFilter, categoryViewMode, trackerId)
        );
    }

    @Get('summary-status')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({ summary: 'Get tracker summary status' })
    @ApiResponse({ status: 200, description: 'Tracker summary status' })
    async getTrackerSummaryStatus(@AuthUser() user: JwtPayload): Promise<TrackerSummaryStatusDto> {
        const businessExternalId = user.business_id;
        const userExternalId = user.sub;
        return await this.queryBus.execute(new GetTrackerSummaryStatusQuery(userExternalId,businessExternalId));
    }

    @Get(':trackerId/assignments')
    @AuthorizedPermissions([Permission.TrackingPanel])
    @ApiOperation({ summary: 'Get tracker assignments' })
    @ApiQuery({
        name: 'categoryViewMode',
        enum: TrackerCategoryViewMode,
        required: true,
        description: 'Category view mode'
    })
    @ApiResponse({ status: 200, description: 'Tracker assignments' })
    async getTrackerAssignments(@Param('trackerId') trackerId: number,
        @Query('categoryViewMode') categoryViewMode: TrackerCategoryViewMode = TrackerCategoryViewMode.CURRENT): Promise<TrackerAssignmentListItemDto[]> {
        return await this.queryBus.execute(new GetTrackerAssignmentListQuery(trackerId, categoryViewMode));
    }
}
