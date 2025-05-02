import { BaseGridViewDto, GridViewDto, SelectItemDto, SelectItemFilter } from "src/common";
import { Vehicle } from "./vehicle.entity";
import { VehicleAssignmentMobileGridResponseDto, VehiclesUserGridResponseDto } from "./dtos";

export const VehicleRepository = Symbol(
    'VehicleRepository',
).valueOf();
export interface VehicleRepository {
    upsertVehicles(vehicles: Vehicle[]): Promise<void>;
    assignVehiclesGrid(filter: BaseGridViewDto, userId: number, businessExternalId: string): Promise<GridViewDto<VehiclesUserGridResponseDto>>;
    unassignVehiclesGrid(filter: BaseGridViewDto, userId: number, businessExternalId: string): Promise<GridViewDto<VehiclesUserGridResponseDto>>;
    vehiclesMobileGrid(filter: BaseGridViewDto, businessExternalId: string, mobileModelId: number): Promise<GridViewDto<VehicleAssignmentMobileGridResponseDto>>;
    getVehiclesByIds(vehicleIds: number[]): Promise<Vehicle[]>;
    getVehiclesByExternalIds(externalIds: string[]): Promise<Vehicle[]>;
    updateTrackerId(vehicleId: number, trackerId: number): Promise<void>;
    getList(filter: SelectItemFilter, businessExternalId: string): Promise<SelectItemDto[]>;
    getVehicleById(vehicleId: number): Promise<Vehicle | null>;
    getVehicleByPlaqueNo(plaqueNo: string): Promise<Vehicle | null>;
    createVehicle(vehicle: Vehicle): Promise<number>;
    existVehicleByExternalId(externalId: string): Promise<boolean>;
    existVehicleByIdentity(identity: string): Promise<boolean>;
    getVehicleByTrackerId(trackerId: number): Promise<Vehicle | null>;
    getVehicleByIdentity(identity: string): Promise<Vehicle | null>;
}
