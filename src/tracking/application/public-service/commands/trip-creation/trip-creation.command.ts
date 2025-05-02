import { ICommand } from '@nestjs/cqrs';
import { TripAreaType, TripCreationService } from 'src/tracking';
import { Geometry, LineString } from 'typeorm';

export class TripCreationCommand implements ICommand {
    constructor(public readonly data: TripCreationCommandModel) { }
}

export interface TripCreationCommandModel {
    imei: string;
    routeCaption: string;
    routeGeoJson: string;
    maximumGeofenceBreach: number;
    routeAllowedAreas?: TripCreationAllowedAreaCommandModel[];

    tripNumber: string;
    duration: number;
    driverName: string;
    tripType: TripCreationService;

    startTrip: Date;
}

export interface TripCreationAllowedAreaCommandModel {
    caption: string;
    type: TripAreaType;
    geoJson: string;
}