import { ICommand } from "@nestjs/cqrs";
import { TrackerAssignmentCreateDto } from "src/tracking/domain";
export class TrackerAssignmentCreateCommand implements ICommand {
    constructor(public readonly createDto: TrackerAssignmentCreateDto) { }
}