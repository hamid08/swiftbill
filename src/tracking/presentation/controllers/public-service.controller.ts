import { Controller, Post, Body, Headers, Param, UseGuards, Version, Put, Get, Query, ParseArrayPipe, Patch, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiKeyGuard, GridViewDto, ParseDatePipe, TypeTrackingDataValidationPipe } from 'src/common';
import {
    PublicRegisterTrackerCommand,
    PublicEndTrackerAssignmentCommand,
    PublicRegisterTrackerDto,
    PublicTrackerAssignmentUpdateDto,
    PublicTrackerAssignmentUpdateCommand,
    GetNearbyVehicleQuery,
    GetNearbyVehicleRequestDto,
    GetVehicleTrackingInfoQuery,
    GetPublicTrackingDataQuery,
} from 'src/tracking/application';
import { GetVehicleTrackingInfoResponseDto, NearbyTrackerResponseDto, PublicTrackingDataResponseDto } from 'src/tracking/domain';

@ApiTags('Public Services')
@Controller('v1')
@ApiHeader({
    name: 'X-API-KEY',
    description: 'Partner authentication key Or Secure Apps'
})
@UseGuards(ApiKeyGuard)
export class PublicServicesController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    //#region Tracker Registration
    @Post('trackers')
    @ApiOperation({
        summary: 'Register tracking device',
        description: 'Registers a new tracker from authorized partners'
    })
    @ApiResponse({
        status: 201,
        description: 'Tracker registered successfully',
    })
    @ApiBody({ type: PublicRegisterTrackerDto })
    async registerTracker(
        @Body() trackerDto: PublicRegisterTrackerDto,
    ): Promise<void> {
        return await this.commandBus.execute(new PublicRegisterTrackerCommand(trackerDto));
    }
    //#endregion

    //#region Tracker EndAssignment
    @Patch('trackers/:imei/end-assignment')
    @ApiOperation({ summary: 'End Tracker Assignment' })
    @ApiResponse({
        status: 200,
        description: 'Tracker Assignment ended successfully'
    })
    async endAssignment(@Param('imei') imei: string): Promise<void> {
        return await this.commandBus.execute(new PublicEndTrackerAssignmentCommand(imei));
    }
    //#endregion

    //#region Tracker Assignment
    @Put('trackers/:imei')
    @ApiOperation({ summary: 'Update Tracker Assignment' })
    @ApiResponse({
        status: 200,
        description: 'Tracker Assignment updated successfully'
    })
    async updateAssignment(@Param('imei') imei: string, @Body() updateDto: PublicTrackerAssignmentUpdateDto): Promise<void> {
        return await this.commandBus.execute(new PublicTrackerAssignmentUpdateCommand(imei, updateDto));
    }
    //#endregion

    //#region Nearby Vehicles
    @Get('trackers/nearby')
    @ApiOperation({ summary: 'Get Nearby Vehicles' })
    @ApiResponse({
        status: 200,
        description: 'Nearby vehicles retrieved successfully'
    })
    async getNearbyVehicles(@Query() dto: GetNearbyVehicleRequestDto): Promise<NearbyTrackerResponseDto> {
        return await this.queryBus.execute(new GetNearbyVehicleQuery(dto));
    }
    //#endregion

    //#region Vehicle Tracking Info

    @Get('trackers/vehicle-tracking-info')
    @ApiOperation({ summary: 'Get Vehicle Tracking Info' })
    @ApiResponse({
        status: 200,
        description: 'Vehicle tracking info retrieved successfully'
    })
    @ApiQuery({
        name: 'vehicleIds',
        type: [String],
        description: 'Array of vehicle ids',
        required: true,
        example: ['1', '2', '3']
    })
    async getVehicleTrackingInfo(@Query('vehicleIds', new ParseArrayPipe({
        items: String,
        optional: false
    }))
    vehicleIds: string[]): Promise<GetVehicleTrackingInfoResponseDto[]> {
        return await this.queryBus.execute(new GetVehicleTrackingInfoQuery(vehicleIds));
    }
    //#endregion

    //#region Get Tracking Data (Unified Endpoint)
    @Get('tracking-data/:type/:identifier')
    @ApiOperation({ summary: 'Get Tracking Data by IMEI (device) or Vehicle Identity (vehicle)' })
    @ApiResponse({
        status: 200,
        description: 'Tracking data retrieved successfully',
        type: PublicTrackingDataResponseDto
    })
    @ApiParam({
        name: 'type',
        enum: ['device', 'vehicle'],
        description: 'Type of identifier (device for IMEI, vehicle for Vehicle Identity)'
    })
    @ApiParam({
        name: 'identifier',
        description: 'IMEI number (for device) or Vehicle Identity (for vehicle)'
    })
    @ApiQuery({
        name: 'fromDate',
        required: true,
        description: 'Start date for tracking data'
    })
    @ApiQuery({
        name: 'toDate',
        required: true,
        description: 'End date for tracking data'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number (default: 1)',
        type: Number,
        example: 1
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Items per page (default: 1000)',
        type: Number,
        example: 1000
    })
    async getTrackingData(
        @Param('type', new TypeTrackingDataValidationPipe()) type: 'device' | 'vehicle',
        @Param('identifier') identifier: string,
        @Query('fromDate', new ParseDatePipe()) fromDate: Date,
        @Query('toDate', new ParseDatePipe()) toDate: Date,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ): Promise<PublicTrackingDataResponseDto> {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 1000;

        return await this.queryBus.execute(
            new GetPublicTrackingDataQuery(
                fromDate,
                toDate,
                identifier,
                type,
                pageNumber,
                limitNumber
            )
        );
    }
    //#endregion

}