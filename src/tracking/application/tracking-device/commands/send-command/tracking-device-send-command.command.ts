import { ICommand } from "@nestjs/cqrs";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { TrackingModelCommand } from "src/tracking/domain";
import { ApiProperty } from "@nestjs/swagger";


export class TrackingDeviceSendCommandCommand implements ICommand {
    constructor(public readonly dto: TrackingDeviceSendCommandCommandDto) { }
}

export class TrackingDeviceSendCommandCommandDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'Tracker assignment id' })
    trackerAssignmentId: number;

    @IsNotEmpty()
    @IsEnum(TrackingModelCommand, { message: 'Invalid command' })
    @ApiProperty({ description: 'Command' })    
    command: TrackingModelCommand;
}

