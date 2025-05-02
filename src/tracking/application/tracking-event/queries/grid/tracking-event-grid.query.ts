import { IQuery } from '@nestjs/cqrs';
import { BaseGridViewDto } from 'src/common';
import { TrackingEventFilterType } from 'src/tracking/domain';
export class TrackingEventGridQuery implements IQuery {
    constructor(public readonly filter: BaseGridViewDto, public readonly businessExternalId: string, public readonly filterType: TrackingEventFilterType) { }
}