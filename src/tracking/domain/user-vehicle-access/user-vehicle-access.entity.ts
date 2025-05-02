import { Entity } from "src/common";

export class UserVehicleAccess extends Entity {
    private userId: number;
    private vehicleId: number;

    private constructor() {
        super();
    }

    // Static Factory Method
    public static create(userId: number, vehicleId: number): UserVehicleAccess {
        const userVehicleAccess = new UserVehicleAccess();
        userVehicleAccess.setUserId(userId);
        userVehicleAccess.setVehicleId(vehicleId);
        return userVehicleAccess;
    }

    // Map DTO to Domain Entity
    public static mapToDomain(id: number, userId: number, vehicleId: number): UserVehicleAccess {
        const userVehicleAccess = new UserVehicleAccess();
        userVehicleAccess.setId(id);
        userVehicleAccess.setUserId(userId);
        userVehicleAccess.setVehicleId(vehicleId);
        return userVehicleAccess;
    }

    // Getters
    public getId(): number {
        return this.id;
    }

    public getUserId(): number {
        return this.userId;
    }

    public getVehicleId(): number {
        return this.vehicleId;
    }

    // Setters
    public setUserId(userId: number): void {
        this.userId = userId;
    }

    public setVehicleId(vehicleId: number): void {
        this.vehicleId = vehicleId;
    }
}