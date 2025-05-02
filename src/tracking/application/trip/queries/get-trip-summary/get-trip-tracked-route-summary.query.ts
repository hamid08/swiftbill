import { IQuery } from "@nestjs/cqrs";

export class GetTripTrackedRouteSummaryQuery implements IQuery {
    constructor(public readonly trackerAssignmentId: number, public readonly tripId: number) { }
}