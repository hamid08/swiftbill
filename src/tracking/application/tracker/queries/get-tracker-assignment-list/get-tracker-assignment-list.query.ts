import { IQuery } from '@nestjs/cqrs';
import { TrackerCategoryViewMode } from 'src/tracking/domain';

export class GetTrackerAssignmentListQuery implements IQuery {
    constructor(
        public readonly trackerId: number,
        public readonly categoryViewMode: TrackerCategoryViewMode,
    ) { }
}