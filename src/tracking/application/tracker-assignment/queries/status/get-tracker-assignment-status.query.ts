import { IQuery } from "@nestjs/cqrs";

export class GetTrackerAssignmentStatusQuery implements IQuery {
    constructor(public readonly trackingAssignmentId: number, public readonly fetchAllIoParameters: boolean) { }
}