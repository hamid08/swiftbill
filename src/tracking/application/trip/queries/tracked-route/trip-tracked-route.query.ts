import { IQuery } from '@nestjs/cqrs';

export class TripTrackedRouteQuery implements IQuery {
    constructor(
        public trackerAssignmentId: number,
        public pageIndex: number,
        public fetchCurrentTrip: boolean,
        public tripId?: number
    ) { }
}