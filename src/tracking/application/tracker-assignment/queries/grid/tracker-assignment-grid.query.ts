import { IQuery } from '@nestjs/cqrs';
import { BaseGridViewDto } from 'src/common';

export class TrackerAssignmentGridQuery implements IQuery {
    constructor(public filter: BaseGridViewDto, public businessExternalId: string) { }
}