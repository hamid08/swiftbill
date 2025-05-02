import { TrackingExtensionStatus } from "../tracking-extension.enum";

export interface TrackingExtensionDomainDto {
    id: number;
    extensionId: string;
    caption: string;
    description: string;
    status: TrackingExtensionStatus;
    updatedAt: Date;
    deviceId: number;
}