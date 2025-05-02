import { TrackingModelCommand } from "../tracking-model.enum";

export interface TrackingModelUpsertDomainDto {
    externalId: string;
    name: string;
    caption?: string;
    brandId: number;
    supportedCommands: TrackingModelCommand[];
    isMobile: boolean;
    isSupportedExtension: boolean;
}