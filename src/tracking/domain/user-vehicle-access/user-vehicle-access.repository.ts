import { UserVehicleAccess } from "./user-vehicle-access.entity";

export const UserVehicleAccessRepository = Symbol(
    'UserVehicleAccessRepository',
).valueOf();
export interface UserVehicleAccessRepository {
    assignVehicleToUser(userId: number, vehicleIds: number[]): Promise<void>;
    unassignVehicleFromUser(userId: number, vehicleIds: number[]): Promise<void>;
}
