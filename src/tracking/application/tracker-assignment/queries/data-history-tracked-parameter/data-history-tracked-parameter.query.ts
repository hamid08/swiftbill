import { IQuery } from "@nestjs/cqrs";

export class GetDataHistoryTrackedParameterQuery implements IQuery {
    constructor(
        public readonly trackingAssignmentId: number,
        public readonly parameterKey: string,
        public readonly fromDate: Date,
        public readonly toDate: Date
    ) { }
}
