import { IQuery } from "@nestjs/cqrs";

export class GetTrackingExtensionByIdQuery implements IQuery {
    constructor(public readonly trackingExtensionId: number) { }
}