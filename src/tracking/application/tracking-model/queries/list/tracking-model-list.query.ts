import { IQuery } from "@nestjs/cqrs";

export class TrackingModelListQuery implements IQuery {
    constructor(public readonly trackingBrandId:number) { }
}