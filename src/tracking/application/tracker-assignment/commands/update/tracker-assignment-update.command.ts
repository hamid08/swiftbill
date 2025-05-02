import { ICommand } from "@nestjs/cqrs";
import { TrackerAssignmentUpdateDto } from "src/tracking/domain";
export class TrackerAssignmentUpdateCommand implements ICommand {
    constructor(public readonly trackerAssignmentId: number, public readonly updateDto: TrackerAssignmentUpdateDto) { }
}