
export interface UserTransportSyncResponse {
    fullName: string;
    userName: string;
    userId: string;
    businessIds: string[];
}

export interface UserCoreSyncResponse {
    userInfo: UserCoreSyncInfoResponse,
    businessUserInfos: UserCoreSyncBusinessInfoResponse[];
}

export interface UserCoreSyncInfoResponse {
    id: string;
    firstName: string;
    userName: string;
    lastName: string;
    phoneNumber: string;
}

export interface UserCoreSyncBusinessInfoResponse {
    id: number;
    businessId: string;
    userId: number;
    personnelNumber: string;
    personnelPhoto: string;
    cardNumber: string;
}