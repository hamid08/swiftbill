import { Controller, Get, Put, Logger, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AuthGuard, SelectItemDto } from "src/common";
import { TrackingBrandListQuery } from "src/tracking/application";

@ApiTags('Tracking Brands')
@Controller('tracking-brands')
@UseGuards(AuthGuard)
export class TrackingBrandController {
  private readonly logger = new Logger(TrackingBrandController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get('list')
  @ApiOperation({
    summary: 'Get tracking brands',
    description: 'Retrieves all current tracking brands list'
  })
  @ApiResponse({
    status: 200,
    description: 'TrackingBrands successfully retrieved',
    type: SelectItemDto
  })
  async getSettings(): Promise<SelectItemDto[]> {
    return await this.queryBus.execute(
      new TrackingBrandListQuery()
    );
  }
}