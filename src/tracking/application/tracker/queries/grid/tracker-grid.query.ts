import { IQuery } from '@nestjs/cqrs';
import { BaseGridViewDto } from 'src/common';
import { TrackerCategoryViewMode, TrackerStatusFilter } from 'src/tracking/domain';

export class TrackerGridQuery implements IQuery {
    constructor(
        public readonly userExternalId: string,
        public readonly filter: BaseGridViewDto,
        public readonly businessExternalId: string,
        public readonly statusFilter: TrackerStatusFilter,
        public readonly categoryViewMode: TrackerCategoryViewMode,
        public readonly trackerId?: number, //Note: if this is provided, the filter will be ignored
    ) { }
}