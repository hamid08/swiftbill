import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class TrackerAssignmentUpdateDto {
    @ApiProperty({
        description: 'شماره IMEI دستگاه ردیابی',
        example: '123456789012345'
    })
    @IsNotEmpty({ message: 'شماره IMEI نمی‌تواند خالی باشد' })
    @IsString({ message: 'شماره IMEI باید رشته باشد' })
    imei: string;

    @ApiProperty({
        description: 'شماره سریال دستگاه ردیابی',
        example: 'SN12345678'
    })
    @IsNotEmpty({ message: 'شماره سریال نمی‌تواند خالی باشد' })
    @IsString({ message: 'شماره سریال باید رشته باشد' })
    serialNumber: string;

    @ApiProperty({
        description: 'شماره سیم‌کارت دستگاه ردیابی',
        example: '989121234567'
    })
    @IsNotEmpty({ message: 'شماره سیم‌کارت نمی‌تواند خالی باشد' })
    @IsString({ message: 'شماره سیم‌کارت باید رشته باشد' })
    simNumber: string;

    @ApiProperty({
        description: 'رمز عبور ریموت دستگاه (اختیاری)',
        required: false,
        example: '123456'
    })
    @IsOptional()
    @IsString({ message: 'رمز عبور ریموت باید رشته باشد' })
    remotePassword?: string;

    @ApiProperty({
        description: 'شناسه دستگاه (اختیاری)',
        required: false,
        example: 'TRK-001'
    })
    @IsOptional()
    @IsString({ message: 'شناسه دستگاه باید رشته باشد' })
    identity?: string;

    @ApiProperty({
        description: 'شناسه مدل دستگاه',
        example: 1
    })
    @IsNotEmpty({ message: 'شناسه مدل نمی‌تواند خالی باشد' })
    @IsNumber({}, { message: 'شناسه مدل باید عدد باشد' })
    @Type(() => Number) 
    modelId: number;

    @ApiProperty({
        description: 'آیا به عنوان پیش‌فرض تنظیم شود',
        default: false
    })
    @IsBoolean({ message: 'مقدار پیش‌فرض باید true یا false باشد' })
    @Type(() => Boolean) 
    isDefault: boolean;
}