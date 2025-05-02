import { PlaqueStatus, PlaqueType } from "../../enums";

export interface VehicleDomainDto {
    id: number;
    externalId: string;
    name?: string;
    identity: string;
    plaqueStatus: PlaqueStatus;
    plaqueType?: PlaqueType;
    plaqueNo?: string;
    vehicleModelName?: string;
    vehicleModelId?: string;
    userTypeName?: string;
    userTypeId?: string;
    companyName?: string;
    image?: string;
    imei?: string;
    businessId: number;
    trackerId?: number;
}