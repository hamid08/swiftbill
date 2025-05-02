import { IQuery } from '@nestjs/cqrs';
export class GetSupportedCommandQuery implements IQuery {
    constructor(public readonly trackerAssignmentId: number) { }
}