import { SelectItemDto } from "src/common";
import { IoElement } from "../value-objects/io-element";
import { IoParameter } from "./io-parameter.entity";

export const IoParameterRepository = Symbol(
    'IoParameterRepository',
).valueOf();
export interface IoParameterRepository {

    upsertIoParameters(ioParameters: IoParameter[]): Promise<void>;
    getAllIoParameters(): Promise<IoParameter[]>;
    getIoParameterByExternalId(externalId: string): Promise<IoParameter | null>;
    getIoParameterByKey(key: string): Promise<IoParameter | null>;
    getIoParameterByName(name: string): Promise<IoParameter | null>;
    getTransformedIoElements(ioElements: IoElement[]): Promise<IoElement[]>;
    getList(): Promise<SelectItemDto<string>[]>;
}
