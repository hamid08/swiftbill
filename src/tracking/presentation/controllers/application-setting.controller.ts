import { Controller, Get, Put, Logger, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApplicationSettingDto,
  ApplicationSettingGetQuery,
  ApplicationSettingUpdateCommand,
  ApplicationSettingUpdateDto
} from "src/tracking/application";
import { AuthGuard, AuthorizedPermissions, Permission } from "src/common";

@ApiTags('Application Settings')
@Controller('application-settings')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanelSetting])
export class ApplicationSettingController {
  private readonly logger = new Logger(ApplicationSettingController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  //#region Update Application Settings
  /**
   * Update application settings
   * @param updateDto Settings update payload
   */
  @Put()
  @ApiOperation({
    summary: 'Update application settings',
    description: 'Updates all application settings at once'
  })
  @ApiBody({
    type: ApplicationSettingUpdateDto,
    description: 'Settings update payload'
  })
  @ApiResponse({
    status: 204,
    description: 'Settings successfully updated'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload'
  })
  async updateSettings(
    @Body() updateDto: ApplicationSettingUpdateDto
  ): Promise<void> {
    await this.commandBus.execute(
      new ApplicationSettingUpdateCommand(updateDto)
    );
  }
  //#endregion  

  //#region Get Application Settings
  /**
   * Get current application settings
   * @returns Current application settings
   */
  @Get()
  @ApiOperation({
    summary: 'Get application settings',
    description: 'Retrieves all current application settings'
  })
  @ApiResponse({
    status: 200,
    description: 'Settings successfully retrieved',
    type: ApplicationSettingDto
  })
  async getSettings(): Promise<ApplicationSettingDto> {
    return await this.queryBus.execute(
      new ApplicationSettingGetQuery()
    );
  }
  //#endregion
}