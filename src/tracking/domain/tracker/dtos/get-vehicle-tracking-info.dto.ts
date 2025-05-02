export class GetVehicleTrackingInfoResponseDto {
    vehicleId: string;
    lat?: number;
    lng?: number;
    angle?: number;
    altitude?: number;
    speed?: number;
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
}
