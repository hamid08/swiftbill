import { IQuery } from "@nestjs/cqrs";

export class GetWeatherDataQuery implements IQuery {
    constructor(public readonly latitude: number, public readonly longitude: number) { }
}