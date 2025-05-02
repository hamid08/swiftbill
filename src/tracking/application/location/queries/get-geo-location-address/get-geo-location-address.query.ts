import { IQuery } from "@nestjs/cqrs";

export class GetGeoLocationAddressQuery implements IQuery {
    constructor(public readonly latitude: number, public readonly longitude: number) { }
}