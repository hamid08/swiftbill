import { Controller, Post, Logger, UseInterceptors, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CommandBus } from "@nestjs/cqrs";
import { BusinessSyncCommand } from "src/tracking/application";
import { AuthGuard, AuthorizedPermissions, Permission, ProcessStepsLogger } from "src/common";

@ApiTags('Businesses')
@Controller('businesses')
@UseGuards(AuthGuard)
export class BusinessController {
    private readonly logger = new Logger(BusinessController.name);

    constructor(private readonly commandBus: CommandBus) {}

    //#region Synchronize Businesses
    /**
     * Synchronize businesses with external provider
     * @returns Promise<void>
     */
    @Post('synchronization')
    @AuthorizedPermissions([Permission.TrackingPanelSetting])
    @UseInterceptors(ProcessStepsLogger)
    @ApiOperation({
        summary: 'Trigger business synchronization',
        description: 'Initiates synchronization of businesses from external data provider',
    })
    @ApiResponse({ 
        status: 202, 
        description: 'Synchronization request accepted and being processed' 
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - authentication required' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Internal server error during synchronization process' 
    })
    async synchronize(): Promise<void> {
        await this.commandBus.execute(new BusinessSyncCommand());
    }
    //#endregion
}