import { IQuery } from "@nestjs/cqrs";

export class GetExtensionLatestLocationQuery implements IQuery {
    constructor(public readonly trackingAssignmentId: number, public readonly trackingExtensionId: number) { }
}