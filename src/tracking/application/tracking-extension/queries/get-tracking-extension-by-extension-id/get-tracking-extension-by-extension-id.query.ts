import { IQuery } from "@nestjs/cqrs";

export class GetTrackingExtensionByExtensionIdQuery implements IQuery {
    constructor(public readonly extensionId: string) { }
}   