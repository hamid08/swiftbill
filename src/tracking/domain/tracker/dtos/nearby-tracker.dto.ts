export class NearbyTrackerResponseDto {
    locations: NearbyTrackerLocationResponseDto[];
    pagination: { page: number; limit: number; total: number };
}

export class NearbyTrackerLocationResponseDto {
    vehicleId: string;
    lat?: number;
    lng?: number;
    angle?: number;
    altitude?: number;
    speed?: number;
    lastTrackedAt?: Date;
    lastConnectedAt?: Date;
    distance?: number;
}

