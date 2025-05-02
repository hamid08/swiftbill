import { Entity } from "src/common";
import { TrackingBrandDomainDto, TrackingBrandUpsertDomainDto } from "./dtos";
import { TrackingModel } from "../tracking-model";

export class TrackingBrand extends Entity {
    private externalId: string;
    private name: string;
    private caption?: string;
    private isMobile: boolean;
    private models: TrackingModel[];

    private constructor() {
        super();
    }

    //#region Primary Operations

    /**
     * Maps a DTO to a domain entity.
     */
    public static mapToDomain(dto: TrackingBrandDomainDto): TrackingBrand {
        const brand = new TrackingBrand();

        brand.setId(dto.id);
        brand.setExternalId(dto.externalId);
        brand.setName(dto.name);
        brand.setCaption(dto.caption);
        brand.setIsMobile(dto.isMobile);

        return brand;
    }

    /**
     * Creates or updates a TrackingBrand instance.
     */
    public static upsert(dto: TrackingBrandUpsertDomainDto): TrackingBrand {
        const brand = new TrackingBrand();

        brand.setExternalId(dto.externalId);
        brand.setName(dto.name);
        brand.setCaption(dto.caption);
        brand.setIsMobile(dto.isMobile);

        return brand;
    }

    //#endregion

    //#region Setters

    public setId(value: number): void {
        this.id = value;
    }

    public setExternalId(value: string): void {
        this.externalId = value;
    }

    public setName(value: string): void {
        this.name = value;
    }

    public setCaption(value: string): void {
        this.caption = value;
    }

    public setIsMobile(value: boolean): void {
        this.isMobile = value;
    }

    //#endregion

    //#region Getters

    public getId(): number {
        return this.id;
    }

    public getExternalId(): string {
        return this.externalId;
    }

    public getName(): string {
        return this.name;
    }

    public getCaption(): string | undefined {
        return this.caption;
    }

    public getIsMobile(): boolean {
        return this.isMobile;
    }

    //#endregion
}