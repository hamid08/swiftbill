
export interface TrackerAssignmentDomainDto {
    id: number;
    terminalNumber: string;
    isDefault: boolean;
    startDate: Date;
    endDate?: Date;
    trackingDeviceId: number;
    trackerId: number;
}