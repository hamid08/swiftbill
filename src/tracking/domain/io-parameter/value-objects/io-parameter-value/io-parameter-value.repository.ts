import { IoParameterValue } from "./io-parameter-value.vo";

export const IoParameterValueRepository = Symbol(
    'IoParameterValueRepository',
).valueOf();
export interface IoParameterValueRepository {

    upsertIoParameterValues(ioParameterValues: IoParameterValue[]): Promise<void>;
    getAllIoParameterValues(): Promise<IoParameterValue[]>;
}
