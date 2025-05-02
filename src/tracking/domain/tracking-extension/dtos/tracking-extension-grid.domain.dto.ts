import { TrackingExtensionStatus } from "../tracking-extension.enum";

export class TrackingExtensionGridResponseDto {
  id: number;
  extensionId: string;
  caption: string;
  description: string;
  status: TrackingExtensionStatus;
  updateAt: Date;
  lastTrackedAt?: Date;
  lastConnectedAt?: Date;
}

