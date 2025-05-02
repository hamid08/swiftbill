import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException } from "src/common";
import {
    TrackerAssignment, TrackerAssignmentError, TrackerAssignmentRepository,
    TrackingDataRepository, Trip, TripError,
    TripRepository, TripTrackedRouteResponseDto
} from "src/tracking/domain";
import { TripTrackedRouteQuery } from "./trip-tracked-route.query";

@Injectable()
@QueryHandler(TripTrackedRouteQuery)
export class TripTrackedRouteQueryHandler
    implements IQueryHandler<TripTrackedRouteQuery, TripTrackedRouteResponseDto[]> {

    private readonly logger = new Logger(TripTrackedRouteQueryHandler.name);
    private readonly DEFAULT_PAGE_SIZE = 2000;

    constructor(
        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
    ) { }

    async execute(query: TripTrackedRouteQuery): Promise<TripTrackedRouteResponseDto[]> {
        const { tripId, trackerAssignmentId, pageIndex, fetchCurrentTrip } = query;

        const trackerAssignment = await this.validateTrackerAssignment(trackerAssignmentId);
        const trip = await this.getTrip(fetchCurrentTrip, tripId, trackerAssignment.getTrackerId());

        if (!trip) {
            return [];
        }

        return this.fetchTrackedRouteData(
            trackerAssignment.getTerminalNumber(),
            trip.getStartDate(),
            trip.getEndDate(),
            pageIndex
        );
    }

    private async validateTrackerAssignment(trackerAssignmentId: number): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(trackerAssignmentId);
        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }
        return trackerAssignment;
    }

    private async getTrip(
        fetchCurrentTrip: boolean,
        tripId?: number,
        trackerId?: number
    ): Promise<Trip | null> {
        if (fetchCurrentTrip) {
            return this.getCurrentTrip(trackerId!);
        }
        return this.getTripById(tripId!);
    }

    private async getCurrentTrip(trackerId: number): Promise<Trip | null> {
        const currentTrip = await this.tripRepository.getCurrentTrip(trackerId);
        if (!currentTrip) {
            this.logger.warn(`Current trip not found for trackerId: ${trackerId}`);
        }
        return currentTrip;
    }

    private async getTripById(tripId: number): Promise<Trip | null> {
        const trip = await this.tripRepository.getTripById(tripId);
        if (!trip) {
            this.logger.warn(`Trip not found with id: ${tripId}`);
        }
        return trip;
    }

    private async fetchTrackedRouteData(
        terminalNumber: string,
        fromDate: Date,
        toDate?: Date,
        pageIndex: number = 1
    ): Promise<TripTrackedRouteResponseDto[]> {
        return this.trackingDataRepository.getTripTrackedRouteData(
            pageIndex,
            this.DEFAULT_PAGE_SIZE,
            terminalNumber,
            fromDate,
            toDate
        );
    }
}