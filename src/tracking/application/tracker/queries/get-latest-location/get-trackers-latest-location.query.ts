import { IQuery } from '@nestjs/cqrs';

export class GetTrackersLatestLocationQuery implements IQuery {
    constructor(
        public readonly businessExternalId: string,
        public readonly userExternalId: string,
    ) { }
}