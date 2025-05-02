import { IQuery } from '@nestjs/cqrs';
import { BaseGridViewDto } from 'src/common';
export class TripGridQuery implements IQuery {
    constructor(public readonly filter: BaseGridViewDto,
        public readonly trackerAssignmentId: number,
        public readonly fromDate?: Date,
        public readonly toDate?: Date) { }
}