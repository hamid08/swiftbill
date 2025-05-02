import { IQuery } from '@nestjs/cqrs';

export class GetCurrentTripInfoQuery implements IQuery {
    constructor(public readonly trackerAssignmentId: number) { }
}