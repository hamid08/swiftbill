import { IQuery } from "@nestjs/cqrs";

export class TrackerAssignmentInfoQuery implements IQuery {
    constructor(public readonly trackingAssignmentId: number) { }
}