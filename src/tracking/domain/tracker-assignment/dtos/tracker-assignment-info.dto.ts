export class TrackerAssignmentInfoDto {
    imei: string;
    terminalNumber: string;
    isDefault: boolean;
    deviceSerialNumber: string;
    deviceBrandingName: string;
    deviceSimCardNumber: string;
    startDate: Date;
    endDate?: Date;
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
}
