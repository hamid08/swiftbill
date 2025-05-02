import { Entity } from "src/common";
import { UserCreateDomainDto, UserDomainDto } from "./dtos";

export class User extends Entity {
    private externalId: string;
    private displayName?: string;
    private username: string;
    private updatedAt: Date;
    private accessToAllVehicles: boolean;
    private businessExternalIds: string;
    // private accessibleVehicles: UserVehicleAccess[];

    private constructor() {
        super();
    }

    // Static Factory Method
    public static create(dto: UserCreateDomainDto): User {
        const user = new User();
        user.setExternalId(dto.externalId);
        user.setDisplayName(dto.displayName);
        user.setUsername(dto.username);
        user.setUpdatedAt(new Date());
        user.setAccessToAllVehicles(false);
        user.setBusinessExternalIds(dto.businessExternalIds);
        return user;
    }

    // Map DTO to Domain Entity
    public static mapToDomain(dto: UserDomainDto): User {
        const user = new User();
        user.setId(dto.id);
        user.setExternalId(dto.externalId);
        user.setDisplayName(dto.displayName);
        user.setUsername(dto.username);
        user.setUpdatedAt(dto.updatedAt);
        user.setAccessToAllVehicles(dto.accessToAllVehicles);
        return user;
    }

    // Getters
    public getId(): number {
        return this.id;
    }

    public getBusinessExternalIdsArray(): string[] {
        return User.getBusinessExternalIds(this.businessExternalIds);
    }

    public getBusinessExternalIds(): string {
        return this.businessExternalIds;
    }

    public getExternalId(): string {
        return this.externalId;
    }

    public getDisplayName(): string | undefined {
        return this.displayName;
    }

    public getUsername(): string {
        return this.username;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public getAccessToAllVehicles(): boolean {
        return this.accessToAllVehicles;
    }

    // public getAccessibleVehicles(): UserVehicleAccess[] {
    //     return this.accessibleVehicles;
    // }

    // Setters
    public setExternalId(externalId: string): void {
        this.externalId = externalId;
    }

    public setBusinessExternalIds(businessExternalIds: string[]): void {
        this.businessExternalIds = User.setBusinessExternalIds(businessExternalIds);
    }

    public setDisplayName(displayName: string | undefined): void {
        this.displayName = displayName;
    }

    public setUsername(username: string): void {
        this.username = username;
    }

    public setUpdatedAt(updatedAt: Date): void {
        this.updatedAt = updatedAt;
    }

    public setAccessToAllVehicles(accessToAllVehicles: boolean): void {
        this.accessToAllVehicles = accessToAllVehicles;
    }

    // public setAccessibleVehicles(accessibleVehicles: UserVehicleAccess[]): void {
    //     this.accessibleVehicles = accessibleVehicles;
    // }


    //tools
    public static getBusinessExternalIds(businessExternalIds: string): string[] {
        return businessExternalIds.split(',');
    }

    public static setBusinessExternalIds(businessExternalIds: string[]): string {
        return businessExternalIds.join(',');
    }
}