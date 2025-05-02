import { Controller, Get, Param, Logger, Query, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { QueryBus } from "@nestjs/cqrs";
import { TripRouteResponseDto, TripGridResponseDto, TripTrackedRouteResponseDto, CurrentTripInfoDto, TrackingDataHistoryTrackedRouteSummaryDto } from "src/tracking/domain";
import {
  GetCurrentTripInfoQuery,
  GetTripQuery,
  TripGridQuery,
  GetTripTrackedRouteSummaryQuery,
  TripTrackedRouteQuery
} from "src/tracking/application";
import {
  AuthGuard,
  AuthorizedPermissions,
  BaseGridViewDto,
  DateTimeUtils,
  GridViewDto,
  ParseDatePipe,
  Permission
} from "src/common";

@ApiTags('Trips')
@Controller('trips')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanel])
export class TripController {
  private readonly logger = new Logger(TripController.name);

  constructor(private readonly queryBus: QueryBus) { }

  //#region Current Trip

  @Get(':trackerAssignmentId/current-trip')
  @ApiOperation({
    summary: 'Get current trip by tracker ID',
    description: 'Retrieves the currently current trip for the specified tracker device'
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved active trip',
    type: CurrentTripInfoDto
  })
  @ApiResponse({
    status: 404,
    description: 'No active trip found for the specified tracker'
  })
  async getCurrentTrip(
    @Param('trackerAssignmentId') trackerAssignmentId: number
  ): Promise<TripRouteResponseDto | null> {
    return await this.queryBus.execute(new GetTripQuery(trackerAssignmentId, true));
  }

  //#endregion


  //#region Current Trip Info

  @Get(':trackerAssignmentId/current-trip/info')
  @ApiOperation({
    summary: 'Get current trip by tracker ID',
    description: 'Retrieves the currently current trip for the specified tracker device'
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved active trip',
    type: CurrentTripInfoDto
  })
  @ApiResponse({
    status: 404,
    description: 'No active trip found for the specified tracker'
  })
  async getCurrentTripInfo(
    @Param('trackerAssignmentId') trackerAssignmentId: number
  ): Promise<CurrentTripInfoDto> {
    return await this.queryBus.execute(new GetCurrentTripInfoQuery(trackerAssignmentId));
  }

  //#endregion

  //#region Current Tracked Route
  @Get(':trackerAssignmentId/current-trip/tracked-route')
  @ApiOperation({
    summary: 'Get trip route grid',
    description: 'Retrieves grid of tracked route points for a specific trip'
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiQuery({
    name: 'pageIndex',
    type: Number,
    required: false,
    description: 'Page index (default: 1)',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Route grid retrieved successfully',
    type: [TripTrackedRouteResponseDto]
  })
  async getCurrentTripTrackedRoute(
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Query('pageIndex') pageIndex = 1
  ): Promise<TripTrackedRouteResponseDto[]> {
    return await this.queryBus.execute(
      new TripTrackedRouteQuery(trackerAssignmentId, pageIndex, true)
    );
  }
  //#endregion

  //#region Trip Details

  @Get(':trackerAssignmentId/:tripId')
  @ApiOperation({
    summary: 'Get trip details',
    description: 'Retrieves complete details for the specified trip'
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiParam({
    name: 'tripId',
    type: Number,
    description: 'ID of the trip',
    example: 67890
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved trip details',
    type: TripRouteResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found with the specified ID'
  })
  async getTrip(
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Param('tripId') tripId: number
  ): Promise<TripRouteResponseDto> {
    return await this.queryBus.execute(new GetTripQuery(trackerAssignmentId, false, tripId));
  }

  //#endregion

  //#region  Grid
  /**
   * Get paginated trip grid data
   * @param filter Grid filtering/pagination options
   * @param trackerAssignmentId ID of the tracker assignment
   * @param fromDate Optional start date filter
   * @param toDate Optional end date filter
   * @returns Paginated trip data
   */
  @Post(':trackerAssignmentId/grid')
  @ApiOperation({
    summary: 'Get trip grid data',
    description: 'Retrieves paginated trip data with filtering options'
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved trip grid',
    type: GridViewDto<TripGridResponseDto>
  })
  async getTripGrid(
    @Body() filter: BaseGridViewDto,
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Query('fromDate', new ParseDatePipe()) fromDate?: Date,
    @Query('toDate', new ParseDatePipe()) toDate?: Date
  ): Promise<GridViewDto<TripGridResponseDto>> {

    const { effectiveFromDate, effectiveToDate } = DateTimeUtils.getDateRange({
      fromDate,
      toDate,
      defaultDays: 7
    });

    return this.queryBus.execute(
      new TripGridQuery(filter, trackerAssignmentId, effectiveFromDate, effectiveToDate)
    );
  }

  //#endregion

  //#region Trip Summary
  /**
   * Get trip summary data
   * @param trackerAssignmentId ID of the tracker assignment
   * @param tripId ID of the trip
   * @returns Trip summary information
   */
  @Get(':trackerAssignmentId/:tripId/summary')
  @ApiOperation({
    summary: 'Get trip summary',
    description: 'Retrieves summary information for a specific trip'
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiParam({
    name: 'tripId',
    type: Number,
    description: 'ID of the trip',
    example: 67890
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved trip summary',
    type: TrackingDataHistoryTrackedRouteSummaryDto
  })
  async getTripTrackedRouteSummary(
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Param('tripId') tripId: number
  ): Promise<TrackingDataHistoryTrackedRouteSummaryDto> {
    return this.queryBus.execute(
      new GetTripTrackedRouteSummaryQuery(trackerAssignmentId, tripId)
    );
  }

  //#endregion

  //#region Trip Tracked Route

  @Get(':trackerAssignmentId/:tripId/tracked-route')
  @ApiOperation({
    summary: 'Get trip route grid',
    description: 'Retrieves grid of tracked route points for a specific trip'
  })
  @ApiParam({
    name: 'tripId',
    type: Number,
    description: 'ID of the trip',
    example: 67890
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiQuery({
    name: 'pageIndex',
    type: Number,
    required: false,
    description: 'Page index (default: 1)',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Route grid retrieved successfully',
    type: [TripTrackedRouteResponseDto]
  })
  async getTripTrackedRoute(
    @Param('tripId') tripId: number,
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Query('pageIndex') pageIndex = 1
  ): Promise<TripTrackedRouteResponseDto[]> {
    return await this.queryBus.execute(
      new TripTrackedRouteQuery(trackerAssignmentId, pageIndex, false, tripId)
    );
  }
  //#endregion

}