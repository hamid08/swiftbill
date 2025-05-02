export interface UserCreateDomainDto {
    externalId: string;
    displayName?: string;
    username: string;
    businessExternalIds: string[];
}