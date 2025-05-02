import { IQuery } from '@nestjs/cqrs';
import { BaseGridViewDto } from 'src/common';

export class ViolationGridQuery implements IQuery {
    constructor(
        public filter: BaseGridViewDto,
        public trackerAssignmentId: number,
        public tripId?: number
    ) { }
}