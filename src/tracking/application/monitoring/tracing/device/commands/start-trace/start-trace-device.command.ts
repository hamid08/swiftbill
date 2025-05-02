import { ICommand } from "@nestjs/cqrs";

export class StartTraceDeviceCommand implements ICommand {
    constructor(public readonly imei: string) { }
}