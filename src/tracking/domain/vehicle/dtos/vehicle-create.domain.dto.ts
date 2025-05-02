import { PlaqueStatus, PlaqueType } from "../../enums";

export interface VehicleCreateDomainDto {
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
}