import { Controller, Get, Put, Logger, Body, UseGuards, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AuthGuard, AuthorizedPermissions, Permission, SelectItemDto } from "src/common";
import { IoParameterListQuery } from "src/tracking/application";

@ApiTags('Panel')
@Controller('panel')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanel])
export class PanelController {
    private readonly logger = new Logger(PanelController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }


    @Get('config')
    @ApiOperation({
        summary: 'اطلاع از ورود به پنل',
        description: 'تنظیمات پنل'
    })
    async getConfig(): Promise<{}> {
        return {};
    }

    //#region  Get IoParameter List

    @Get('io-parameters/list')
    @ApiOperation({
        summary: 'Get ioParameters list',
        description: 'Retrieves all current ioParameters list'
    })
    @ApiResponse({
        status: 200,
        description: 'IoParameters successfully retrieved',
    })
    async getIoParameterList(): Promise<SelectItemDto[]> {
        return await this.queryBus.execute(
            new IoParameterListQuery()
        );
    }

    //#endregion

}