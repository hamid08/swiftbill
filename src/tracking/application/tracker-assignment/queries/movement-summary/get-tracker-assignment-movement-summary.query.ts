import { IQuery } from "@nestjs/cqrs";

export class GetTrackerAssignmentMovementSummaryQuery implements IQuery {
    constructor(public readonly trackingAssignmentId: number, public readonly hours: number) { }
}