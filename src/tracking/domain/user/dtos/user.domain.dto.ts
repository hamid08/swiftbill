export interface UserDomainDto {
    id: number;
    externalId: string;
    displayName?: string;
    username: string;
    updatedAt: Date;
    accessToAllVehicles: boolean;
}