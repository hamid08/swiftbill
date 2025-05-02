import { IQuery } from "@nestjs/cqrs";

export class TrackerAssignmentUpdateInfoQuery implements IQuery {
    constructor(public readonly trackingAssignmentId: number) { }
}