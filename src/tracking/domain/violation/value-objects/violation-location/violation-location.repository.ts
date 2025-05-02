import { ViolationLocationType } from "./violation-location.enum";
import { ViolationLocation } from "./violation-location.vo";
export const ViolationLocationRepository = Symbol(
    'ViolationLocationRepository',
).valueOf();
export interface ViolationLocationRepository {

    createViolationLocation(violationLocation: ViolationLocation): Promise<void>;
}
