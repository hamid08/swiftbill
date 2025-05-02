import { IQuery } from "@nestjs/cqrs";

export class GetDataHistoryQuery implements IQuery{
    constructor(
        public readonly trackingAssignmentId: number,
        public readonly fromDate: Date,
        public readonly toDate: Date,
        public readonly fromTime?: string,
        public readonly toTime?: string
    ) { }
}
