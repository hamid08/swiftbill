import { IQuery } from "@nestjs/cqrs";

export class GetDataHistoryTrackedRouteQuery implements IQuery {
    constructor(
        public readonly trackingAssignmentId: number,
        public readonly fromDate: Date,
        public readonly toDate: Date
    ) { }
}
