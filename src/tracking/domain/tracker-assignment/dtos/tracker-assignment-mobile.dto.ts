import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class TrackerAssignmentMobileDto {
    @ApiProperty({
        type: [Number],
        description: 'Array of vehicle IDs to assign trackers to',
        example: [1, 2, 3]
    })
    @IsArray()
    @IsNotEmpty()
    vehicleIds: number[];

    @ApiProperty({
        type: Boolean,
        default: false,
        description: 'Whether this should be the default assignment',
        required: false
    })
    @IsBoolean()
    isDefault: boolean = false; // Set default value here
}

export class TrackerAssignmentMobileVehicleSyncDto {
    externalIds: string[];
    isDefault: boolean = true;
}


