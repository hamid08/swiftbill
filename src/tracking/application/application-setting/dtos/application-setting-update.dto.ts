import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
export class ApplicationSettingUpdateDto {
  @ApiProperty({ example: 10, description: 'Max time between trips in minutes' })
  @IsNumber()
  maxTimeBetweenTripInMinutes: number;

  @ApiProperty({ example: 500, description: 'Max distance between positions in meters' })
  @IsNumber()
  maxDistanceBetweenPositionsInMeters: number;

  @ApiProperty({ example: 5, description: 'Min time to detect connected tracker' })
  @IsNumber()
  minTimeToDetectConnectedTracker: number;

  @ApiProperty({ example: 30, description: 'Max overspeed duration in seconds' })
  @IsNumber()
  maxOverspeedDurationSeconds: number;

  @ApiProperty({ example: 20, description: 'Min allowed speed in km/h' })
  @IsNumber()
  minAllowedSpeedKmPerHour: number;

  @ApiProperty({ example: 120, description: 'Fault data max allowed speed in km/h' })
  @IsNumber()
  faultDataMaxAllowedSpeedKmPerHour: number;

  @ApiProperty({ example: 1, description: 'Fault data min point distance in km' })
  @IsNumber()
  faultDataMinPointDistanceKm: number;

  @ApiProperty({ example: 15, description: 'Missing data detection time in minutes' })
  @IsNumber()
  missingDataDetectionTimeMinutes: number;
}