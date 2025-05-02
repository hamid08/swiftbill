import { IQuery } from "@nestjs/cqrs";
import { RelativeTimePeriod } from "src/tracking/domain";

export class GetTrackerAssignmentSummaryQuery implements IQuery {
    constructor(public readonly trackingAssignmentId: number, public readonly period: RelativeTimePeriod) { }
}