import { TripArea } from "./trip-area.vo";

export const TripAreaRepository = Symbol(
    'TripAreaRepository',
).valueOf();
export interface TripAreaRepository {
    createTripArea(tripArea: TripArea): Promise<void>;
    getTripAreasByTripId(tripId: number): Promise<TripArea[]>;
}
