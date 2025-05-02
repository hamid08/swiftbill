import { IQuery } from "@nestjs/cqrs";
import { SelectItemFilter } from "src/common";

export class VehicleListQuery implements IQuery {
    constructor(public readonly filter: SelectItemFilter, public readonly businessExternalId: string) { }
}