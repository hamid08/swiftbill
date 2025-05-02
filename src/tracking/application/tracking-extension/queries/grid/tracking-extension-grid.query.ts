import { IQuery } from "@nestjs/cqrs";
import { BaseGridViewDto } from "src/common";

export class TrackingExtensionGridQuery implements IQuery {
    constructor(public filter: BaseGridViewDto, public trackerAssignmentId: number) { }
}

