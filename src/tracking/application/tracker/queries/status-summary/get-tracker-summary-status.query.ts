import { IQuery } from "@nestjs/cqrs";

export class GetTrackerSummaryStatusQuery implements IQuery {
    constructor(public readonly userExternalId: string, public readonly businessExternalId: string) { }
}