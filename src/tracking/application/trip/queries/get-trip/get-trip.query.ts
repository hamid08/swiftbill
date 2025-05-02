import { IQuery } from "@nestjs/cqrs";

export class GetTripQuery implements IQuery {
    constructor(
        public trackerAssignmentId: number,
        public fetchCurrentTrip: boolean,
        public tripId?: number
    ) { }
}