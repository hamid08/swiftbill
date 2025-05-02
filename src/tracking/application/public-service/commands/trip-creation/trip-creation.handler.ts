import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Trip, TripRepository, TripAreaRepository, TripArea, TrackingDeviceRepository } from 'src/tracking/domain';
import { TripCreationAllowedAreaCommandModel, TripCreationCommand } from './trip-creation.command';
import { AppException } from 'src/common';

@CommandHandler(TripCreationCommand)
export class TripCreationCommandHandler implements ICommandHandler<TripCreationCommand, void> {
    private readonly logger = new Logger(TripCreationCommandHandler.name);

    constructor(
        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
        @Inject(TripAreaRepository)
        private readonly tripAreaRepository: TripAreaRepository,
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
    ) { }

    async execute(command: TripCreationCommand): Promise<void> {
        const { data } = command;
        const contextInfo = `IMEI: ${data.imei}`;

        try {
            this.logger.log(`Starting trip creation - ${contextInfo}`);

            // Step 1: Get trackerId
            const trackerId = await this.getActiveTrackerId(data.imei);
            
            // Step 2: Deactivate existing trips
            await this.deactivateExistingTrips(trackerId);

            // Step 3: Create new trip
            const tripId = await this.createNewTrip(trackerId, data);

            // Step 4: Create trip areas if provided
            await this.createTripAreasIfNeeded(tripId, data.routeAllowedAreas);

            this.logger.log(`Successfully completed trip creation - Trip ID: ${tripId}, ${contextInfo}`);
        } catch (error) {
            this.logger.error(`Failed to create trip - ${contextInfo}`, error.stack);
            throw error;
        }
    }

    private async getActiveTrackerId(imei: string): Promise<number> {
        const trackerId = await this.trackingDeviceRepository.getCurrentTrackerIdByImei(imei);
        if (!trackerId) {
            throw AppException.BadRequest(`No active tracker found for IMEI: ${imei}`);
        }
        return trackerId;
    }

    private async deactivateExistingTrips(trackerId: number): Promise<void> {
        await this.tripRepository.deactivateAllTrips(trackerId);
    }

    private async createNewTrip(trackerId: number, data: any): Promise<number> {
        const trip = Trip.create({
            trackerId,
            caption: data.routeCaption,
            maxGeofenceBreaches: data.maximumGeofenceBreach,
            startDate: new Date(data.startTrip),
            creationService: data.tripType,
            tripNumber: data.tripNumber,
            duration: data.duration,
            driverName: data.driverName,
            path: data.routeGeoJson,
        });

        return await this.tripRepository.createTrip(trip);
    }

    private async createTripAreasIfNeeded(tripId: number, areas?: TripCreationAllowedAreaCommandModel[]): Promise<void> {
        if (!areas?.length) {
            this.logger.warn(`No trip areas provided for Trip ID: ${tripId}`);
            return;
        }

        await Promise.all(
            areas.map(area => 
                this.tripAreaRepository.createTripArea(
                    TripArea.create(tripId, area.caption, area.type, area.geoJson)
                )
            )
        );
        this.logger.debug(`Created ${areas.length} trip areas for Trip ID: ${tripId}`);
    }
}