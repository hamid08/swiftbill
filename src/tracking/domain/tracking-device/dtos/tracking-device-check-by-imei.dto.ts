export class TrackingDeviceCheckByImeiResponse {
    imei: string;
    serialNumber: string;
    simNumber: string;
    remotePassword: string;
    identity: string;
    modelId: number;
    brandId: number;
}

export class TrackingDeviceCheckByImeiResponseDto {
    isExists: boolean;
    deviceInfo?: TrackingDeviceCheckByImeiResponse;
}

