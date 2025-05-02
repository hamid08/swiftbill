import { BaseGridViewDto, GridViewDto } from "src/common";
import { CurrentTripInfoDto, TripGridResponseDto, TripRouteResponseDto } from "./dtos";
import { Trip } from "./trip.entity";

export const TripRepository = Symbol(
    'TripRepository',
).valueOf();
export interface TripRepository {

    findAllActiveTrips(trackerId: number): Promise<Trip[]>;
    createTrip(trip: Trip): Promise<number>;
    deactivateAllTrips(trackerId: number): Promise<void>;
    findCurrentTripInfo(trackerId: number): Promise<CurrentTripInfoDto | null>;
    findTripRouteById(tripId: number): Promise<TripRouteResponseDto | null>;
    getGrid(filter: BaseGridViewDto, trackerId: number, fromDate?: Date, toDate?: Date): Promise<GridViewDto<TripGridResponseDto>>;
    getTripById(tripId: number): Promise<Trip | null>;
    getCurrentTrip(trackerId: number): Promise<Trip | null>;
    findCurrentTripRoute(trackerId: number): Promise<TripRouteResponseDto | null>;
}
