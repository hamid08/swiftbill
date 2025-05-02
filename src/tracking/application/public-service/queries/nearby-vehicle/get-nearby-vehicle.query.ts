import { IQuery } from "@nestjs/cqrs";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { AppException } from "src/common";

export class GetNearbyVehicleQuery implements IQuery {
    constructor(public readonly dto: GetNearbyVehicleRequestDto) {

        if (this.dto.lat == null || this.dto.lng == null) {
            throw AppException.BadRequest('Invalid latitude or longitude');
        }
    }
}

export class GetNearbyVehicleRequestDto {
    @ApiProperty({ description: 'Latitude', required: true })
    @IsNumber()
    lat: number;

    @ApiProperty({ description: 'Longitude', required: true })
    @IsNumber()
    lng: number;

    @ApiProperty({ description: 'Maximum distance (meters)', required: false })
    @IsNumber()
    @IsOptional()
    maxDistance?: number;

    @ApiProperty({ description: 'Minimum distance (meters)', required: false })
    @IsNumber()
    @IsOptional()
    minDistance?: number;

    @ApiProperty({ description: 'Business ID', required: false })
    @IsString()
    @IsOptional()
    businessId?: string;

    @ApiProperty({ description: 'Vehicle user type ID', required: false })
    @IsString()
    @IsOptional()
    vehicleUserTypeId?: string;

    @ApiProperty({ 
        description: 'Vehicle model IDs (comma-separated or array)', 
        required: false,
        type: [String] 
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => 
        typeof value === 'string' ? value.split(',') : value
    )
    vehicleModelIds?: string[];

    @ApiProperty({ 
        description: 'Vehicle IDs (comma-separated or array)', 
        required: false,
        type: [String] 
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => 
        typeof value === 'string' ? value.split(',') : value
    )
    vehicleIds?: string[];

    @ApiProperty({ description: 'Page number', required: false })
    @IsNumber()
    @IsOptional()
    page?: number;

    @ApiProperty({ description: 'Items per page', required: false })
    @IsNumber()
    @IsOptional()
    limit?: number;
}
