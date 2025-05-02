import { ICommand } from "@nestjs/cqrs";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PlaqueStatus, PlaqueType } from "src/tracking/domain";
export class PublicRegisterTrackerCommand implements ICommand {
    constructor(public readonly dto: PublicRegisterTrackerDto) { }
}

export class PublicRegisterTrackerDto {
    @ApiProperty({
        example: '490154203237518',
        description: 'Device IMEI number (15-17 digits)',
        minLength: 15,
        maxLength: 17,
        required: true
    })
    @IsNotEmpty()
    @IsString()
    imei: string;

    @ApiProperty({
        example: 'SN1234567890',
        description: 'Device serial number',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    serial: string;

    @ApiProperty({
        example: '989121234567',
        description: 'SIM card number',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    simCardNumber: string;

    @ApiProperty({
        example: '65d3833b8d1d270015a0e5d4',
        description: 'Tracking device model ID',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    modelId: string;

    @ApiProperty({
        enum: PlaqueStatus,
        example: PlaqueStatus.HasPlaque,
        description: 'Vehicle plaque status',
        required: true
    })
    @IsNotEmpty()
    plaqueStatus: PlaqueStatus;

    @ApiPropertyOptional({
        enum: PlaqueType,
        example: PlaqueType.Personal,
        description: 'Optional vehicle plaque type'
    })
    @IsOptional()
    plaqueType?: PlaqueType;

    @ApiPropertyOptional({
        example: '52-د-689-11',
        description: 'Optional vehicle plaque number',
    })
    @IsOptional()
    plaqueNo?: string;
}
