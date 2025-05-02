import { IQuery } from '@nestjs/cqrs';

export class ViolationTrackedRouteQuery implements IQuery {
    constructor(public violationId: number, public trackerAssignmentId: number, public pageIndex: number) { }
}