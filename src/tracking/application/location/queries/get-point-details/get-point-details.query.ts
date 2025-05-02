import { IQuery } from "@nestjs/cqrs";

export class GetPointDetailsQuery implements IQuery {
    constructor(
        public readonly assignmentId: number,
        public readonly latitude: number,
        public readonly longitude: number
    ) { }
}