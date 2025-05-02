import { IQuery } from "@nestjs/cqrs";

export class GetCurrentDriverQuery implements IQuery {
    constructor(public readonly trackerId: number) { }
}