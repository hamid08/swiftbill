export interface TrackerUpdateLocationDomainDto {
    lastTrackedAt: Date;
    lastConnectedAt: Date;
    latitude: number;
    longitude: number;
    angle?: number;
    altitude?: number;
    speed?: number;
}