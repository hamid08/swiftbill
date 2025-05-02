import { TrackingBrand } from "../../tracking-brand";
import { TrackingModelCommand } from "../tracking-model.enum";

export interface TrackingModelDomainDto {
    id: number;
    externalId: string;
    name: string;
    caption?: string;
    brandId: number;
    supportedCommands: TrackingModelCommand[];
    isMobile: boolean;
    isSupportedExtension: boolean;
    brand: TrackingBrand;
}