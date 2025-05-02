import { PlaqueStatus, PlaqueType } from "src/tracking/domain";

export interface VehicleTransportSyncResponse{
    vehicleId: string;
    businessId: string;
    name: string;
    identity: string;
    businessCaption?: string;
    orgChartCaption?: string;
    ownershipTypeCaption?: string;
    plaqueStatus: PlaqueStatus;
    plaqueType?: PlaqueType;
    plaqueNo: string;
    vehicleCategoryCaption?: string;
    manufacturingFactoryCaption?: string;
    vehicleModelCaption?: string;
    vehicleModelId?: string;
    vehicleUserTypeCaption?: string;
    vehicleUserTypeId?: string;
    vehicleUserTypeIcon?: string;
    companyName?: string;
    imei?: string;
}

export interface VehicleFleetSyncResponse{
    vehicleId: string;
    businessId: string;
    name: string;
    identity: string;
    businessCaption?: string;
    orgChartCaption?: string;
    ownershipTypeCaption?: string;
    plaqueType?: PlaqueType;
    plaqueNo: string;
    vehicleCategoryCaption?: string;
    manufacturingFactoryCaption?: string;
    vehicleModelCaption?: string;
    vehicleModelId?: string;
    vehicleUserTypeCaption?: string;
    vehicleUserTypeId?: string;
    vehicleUserTypeIcon?: string;
    
}