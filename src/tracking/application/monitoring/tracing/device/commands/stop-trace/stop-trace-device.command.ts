import { ICommand } from "@nestjs/cqrs";

export class StopTraceDeviceCommand implements ICommand {
    constructor(public readonly imeiList: string[], public readonly requestFromScheduler: boolean = false) { }
}
