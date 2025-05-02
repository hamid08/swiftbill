import { Entity } from "src/common";
import { TrackingModelCommand } from './tracking-model.enum';
import { TrackingModelDomainDto, TrackingModelUpsertDomainDto } from "./dtos";
import { TrackingBrand } from "../tracking-brand";
export class TrackingModel extends Entity {
    private externalId: string;
    private name: string;
    private caption?: string;
    private brandId: number;
    private supportedCommands: TrackingModelCommand[];
    private isMobile: boolean;
    private isSupportedExtension: boolean;
    private brand: TrackingBrand;

    private constructor() {
        super();
    }

    //#region Primary Operations

    /**
     * Maps a DTO to a domain entity.
     */
    public static mapToDomain(dto: TrackingModelDomainDto): TrackingModel {
        const trackingModel = new TrackingModel();

        trackingModel.setId(dto.id);
        trackingModel.setExternalId(dto.externalId);
        trackingModel.setName(dto.name);
        trackingModel.setCaption(dto.caption);
        trackingModel.setBrandId(dto.brandId);
        trackingModel.setSupportedCommands(dto.supportedCommands);
        trackingModel.setIsMobile(dto.isMobile);
        trackingModel.setIsSupportedExtension(dto.isSupportedExtension);
        trackingModel.setBrand(dto.brand);

        return trackingModel;
    }

    /**
     * Creates or updates a TrackingModel instance.
     */
    public static upsert(dto: TrackingModelUpsertDomainDto): TrackingModel {
        const trackingModel = new TrackingModel();

        trackingModel.setExternalId(dto.externalId);
        trackingModel.setName(dto.name);
        trackingModel.setCaption(dto.caption);
        trackingModel.setBrandId(dto.brandId);
        trackingModel.setSupportedCommands(dto.supportedCommands || []);
        trackingModel.setIsMobile(dto.isMobile);
        trackingModel.setIsSupportedExtension(dto.isSupportedExtension);

        return trackingModel;
    }

    //#endregion

    //#region  Tools

    public static getSupportedCommands(commands: string | null | undefined): number[] {
        if (!commands) {  // Handles null, undefined, and empty string
            return [];
        }
        
        return commands
            .split(',')
            .map(command => {
                // Trim whitespace and check if empty
                const trimmedCmd = command.trim();
                if (!trimmedCmd) return undefined;
                
                // Handle numeric strings
                if (!isNaN(Number(trimmedCmd))) {
                    const num = Number(trimmedCmd);
                    if (Object.values(TrackingModelCommand).includes(num)) {
                        return num;
                    }
                }
                
                // Handle string enum names
                const enumValue = TrackingModelCommand[trimmedCmd as keyof typeof TrackingModelCommand];
                return typeof enumValue === 'number' ? enumValue : undefined;
            })
            .filter((value): value is number => value !== undefined);
    }

    public static getSupportedCommandsString(commands: TrackingModelCommand[]): string {
        return commands.join(',');
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

    public setCaption(value: string | undefined): void {
        this.caption = value;
    }

    public setBrandId(value: number): void {
        this.brandId = value;
    }

    public setSupportedCommands(value: TrackingModelCommand[]): void {
        this.supportedCommands = value;
    }

    public setIsMobile(value: boolean): void {
        this.isMobile = value;
    }

    public setIsSupportedExtension(value: boolean): void {
        this.isSupportedExtension = value;
    }

    public setBrand(value: TrackingBrand): void {
        this.brand = value;
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

    public getBrandId(): number {
        return this.brandId;
    }

    public getSupportedCommands(): TrackingModelCommand[] {
        return this.supportedCommands;
    }

    public getIsMobile(): boolean {
        return this.isMobile;
    }

    public getIsSupportedExtension(): boolean {
        return this.isSupportedExtension;
    }

    public getBrand(): TrackingBrand {
        return this.brand;
    }

    //#endregion
}