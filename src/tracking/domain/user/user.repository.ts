import { BaseGridViewDto, GridViewDto } from "src/common";
import { User } from "./user.entity";
import { UserAccessibleDto, UserGridResponseDto } from "./dtos";

export const UserRepository = Symbol(
    'UserRepository',
).valueOf();
export interface UserRepository {
    upsertUsers(users: User[]): Promise<void>;
    grid(filter: BaseGridViewDto, businessExternalId: string): Promise<GridViewDto<UserGridResponseDto>>;
    updateVehicleAccess(userId: number, accessToAllVehicles: boolean): Promise<void>;
    getByUserId(userId: number): Promise<User | null>;
    getUserAccessibles(userExternalId: string): Promise<UserAccessibleDto | null>;
}
