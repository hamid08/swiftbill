import { IQuery } from "@nestjs/cqrs";
import { BaseGridViewDto } from "src/common";

export class UserAssignVehiclesGridQuery implements IQuery {
    constructor(
        public readonly filter: BaseGridViewDto,
        public readonly userId: number,
        public readonly businessExternalId: string
    ) { }
}