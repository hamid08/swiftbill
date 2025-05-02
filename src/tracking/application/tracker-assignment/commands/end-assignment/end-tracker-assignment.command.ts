import { ICommand } from "@nestjs/cqrs";
export class EndTrackerAssignmentCommand implements ICommand {
    constructor(public readonly trackerAssignmentId: number) { }
}