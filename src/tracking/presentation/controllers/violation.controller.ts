import { Body, Controller, Get, Logger, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ViolationGridQuery,
  ViolationTrackedRouteQuery,
} from "src/tracking/application";
import { AuthGuard, AuthorizedPermissions, BaseGridViewDto, GridViewDto, Permission } from "src/common";
import { ViolationGridResponseDto, ViolationTrackedRouteResponseDto } from "src/tracking/domain";

@ApiTags('Violations')
@Controller('violations')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanel])
export class ViolationController {
  private readonly logger = new Logger(ViolationController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  //#region Get Violations Grid
  /**
  * Get violations grid for specific tracker assignment
  * @param trackerAssignmentId The tracker assignment ID
  * @param filter Grid filtering and pagination options
  * @returns Paginated grid of violations
  */
  @Post(':trackerAssignmentId/grid')
  @ApiOperation({
    summary: 'Get violations grid',
    description: 'Retrieves paginated grid of violations with filtering/sorting for a tracker assignment'
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiResponse({
    status: 200,
    description: 'Violations grid retrieved successfully',
    type: GridViewDto<ViolationGridResponseDto>
  })
  @ApiResponse({
    status: 404,
    description: 'Tracker assignment not found'
  })
  async getViolationsGrid(
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Body() filter: BaseGridViewDto
  ): Promise<GridViewDto<ViolationGridResponseDto>> {
    return await this.queryBus.execute(
      new ViolationGridQuery(filter, trackerAssignmentId)
    );
  }
  //#endregion

  //#region Get Tracked Route

  /**
  * Get tracked route grid for a violation
  * @param violationId The violation ID
  * @param trackerAssignmentId The tracker assignment ID
  * @param page Pagination page index (default: 1)
  * @returns Grid of tracked route points
  */
  @Get(':violationId/:trackerAssignmentId/tracked-route')
  @ApiOperation({
    summary: 'Get violation route grid',
    description: 'Retrieves grid of tracked route points for a specific violation'
  })
  @ApiParam({
    name: 'violationId',
    type: Number,
    description: 'ID of the violation',
    example: 67890
  })
  @ApiParam({
    name: 'trackerAssignmentId',
    type: Number,
    description: 'ID of the tracker assignment',
    example: 12345
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page index (default: 1)',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Route grid retrieved successfully',
    type: [ViolationTrackedRouteResponseDto]
  })
  async getViolationTrackedRoute(
    @Param('violationId') violationId: number,
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Query('page') page = 1
  ): Promise<ViolationTrackedRouteResponseDto[]> {
    return await this.queryBus.execute(
      new ViolationTrackedRouteQuery(violationId, trackerAssignmentId, page)
    );
  }
  //#endregion


  /**
    * Get trip-specific violations grid
    * @param trackerAssignmentId The tracker assignment ID
    * @param tripId The trip ID
    * @param filter Grid filtering and pagination options
    * @returns Paginated grid of violations for the trip
    */
  @Post(':trackerAssignmentId/:tripId/grid')
  @ApiOperation({
    summary: 'Get trip violations grid',
    description: 'Retrieves paginated grid of violations for a specific trip'
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
    example: 54321
  })
  @ApiResponse({
    status: 200,
    description: 'Violations grid retrieved successfully',
    type: GridViewDto<ViolationGridResponseDto>
  })
  @ApiResponse({
    status: 404,
    description: 'Tracker assignment or trip not found'
  })
  async getTripViolationsGrid(
    @Param('trackerAssignmentId') trackerAssignmentId: number,
    @Param('tripId') tripId: number,
    @Body() filter: BaseGridViewDto
  ): Promise<GridViewDto<ViolationGridResponseDto>> {
    return await this.queryBus.execute(
      new ViolationGridQuery(filter, trackerAssignmentId, tripId)
    );
  }
}