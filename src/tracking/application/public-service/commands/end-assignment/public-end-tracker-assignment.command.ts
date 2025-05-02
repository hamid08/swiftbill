import { ICommand } from "@nestjs/cqrs";
export class PublicEndTrackerAssignmentCommand implements ICommand {
    constructor(public readonly imei: string) { }
}