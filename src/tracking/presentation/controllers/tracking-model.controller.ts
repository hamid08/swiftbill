import { Controller, Get, Put, Logger, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AuthGuard, AuthorizedPermissions, Permission, SelectItemDto } from "src/common";
import { TrackingModelListQuery } from "src/tracking/application";

@ApiTags('Tracking Models')
@Controller('tracking-models')
@UseGuards(AuthGuard)
export class TrackingModelController {
    private readonly logger = new Logger(TrackingModelController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Get(':trackingBrandId/list')
    @ApiOperation({
        summary: 'Get tracking models',
        description: 'Retrieves all current tracking models list'
    })
    @ApiResponse({
        status: 200,
        description: 'TrackingModels successfully retrieved',
    })
    async getSettings(@Param('trackingBrandId') trackingBrandId: number): Promise<SelectItemDto[]> {
        return await this.queryBus.execute(
            new TrackingModelListQuery(trackingBrandId)
        );
    }
}