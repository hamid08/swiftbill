import { Controller, Get, Query, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AppException } from 'src/common';
import { GeoLocationAddressResponse, GetGeoLocationAddressQuery, GetPointDetailsQuery, GetWeatherDataQuery, WeatherResponseDto } from 'src/tracking/application';
import { PointDetailsDto } from 'src/tracking/domain';
import { AuthGuard, AuthorizedPermissions, Permission } from 'src/common';

@ApiTags('Locations')
@Controller('locations')
@UseGuards(AuthGuard)
@AuthorizedPermissions([Permission.TrackingPanel])
export class LocationController {
    private readonly logger = new Logger(LocationController.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Get('reverse-geocode')
    @ApiOperation({ summary: 'Reverse geocode coordinates to address' })
    @ApiQuery({ name: 'lat', type: Number, required: true, example: 31.2230083, description: 'Latitude' })
    @ApiQuery({ name: 'lng', type: Number, required: true, example: 49.1775883, description: 'Longitude' })
    @ApiResponse({
        status: 200,
        description: 'Returns complete address details',
        type: GeoLocationAddressResponse
    })
    public async reverseGeocode(
        @Query('lat') latitude: number,
        @Query('lng') longitude: number,
    ): Promise<GeoLocationAddressResponse> {
        if (!latitude || !longitude) {
            throw AppException.BadRequest('lat و lng الزامی است');
        }

        return await this.queryBus.execute(new GetGeoLocationAddressQuery(latitude, longitude));
    }

    @Get('weather')
    @ApiOperation({ summary: 'Get weather data for location' })
    @ApiQuery({ name: 'lat', type: Number, required: true, example: 31.2230083 })
    @ApiQuery({ name: 'lng', type: Number, required: true, example: 49.1775883 })
    @ApiResponse({
        status: 200,
        description: 'Returns complete weather data',
        type: WeatherResponseDto
    })
    public async getWeatherData(
        @Query('lat') latitude: number,
        @Query('lng') longitude: number,
    ): Promise<WeatherResponseDto> {

        if (!latitude || !longitude) {
            throw AppException.BadRequest('lat و lng الزامی است');
        }

        return await this.queryBus.execute(new GetWeatherDataQuery(latitude, longitude));
    }

    @Get('point-details')
    @ApiOperation({ summary: 'Get point details' })
    @ApiQuery({ name: 'assignmentId', type: Number, required: true, example: 1 })
    @ApiQuery({ name: 'lat', type: Number, required: true, example: 31.2230083 })
    @ApiQuery({ name: 'lng', type: Number, required: true, example: 49.1775883 })
    public async getPointDetails(
        @Query('assignmentId') assignmentId: number,
        @Query('lat') latitude: number,
        @Query('lng') longitude: number,
    ): Promise<PointDetailsDto> {
        return await this.queryBus.execute(new GetPointDetailsQuery(assignmentId, latitude, longitude));
    }
}