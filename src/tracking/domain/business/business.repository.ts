import { Business } from "./business.entity";

export const BusinessRepository = Symbol(
    'BusinessRepository',
).valueOf();
export interface BusinessRepository {
    upsertBusinesses(businesses: Business[]): Promise<void>;
    getFirstOrDefault(): Promise<Business | null>;
    getAllBusinesses(): Promise<Business[]>;
    getByExternalId(externalId: string): Promise<Business | null>;
}
