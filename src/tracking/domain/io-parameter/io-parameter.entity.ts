import { Entity } from "src/common";
import { IoParameterValue } from "./value-objects";
import { IoParameterDomainDto, IoParameterUpsertDomainDto } from "./dtos";

export class IoParameter extends Entity {
    private externalId: string;
    private caption: string;
    private name: string;
    private parameterKey: string;
    private measurementUnit: string;
    private icon: string;
    private isEvent: boolean;
    private showInPanel: boolean;
    private modelId: number;

    private constructor() {
        super();
    }

    //#region Primary Operations

    /**
     * Maps a DTO to a domain entity.
     */
    public static mapToDomain(dto: IoParameterDomainDto): IoParameter {
        const ioParameter = new IoParameter();

        ioParameter.setId(dto.id);
        ioParameter.setExternalId(dto.externalId);
        ioParameter.setModelId(dto.modelId);
        ioParameter.setCaption(dto.caption);
        ioParameter.setName(dto.name);
        ioParameter.setParameterKey(dto.parameterKey);
        ioParameter.setMeasurementUnit(dto.measurementUnit);
        ioParameter.setIcon(dto.icon);
        ioParameter.setIsEvent(dto.isEvent);
        ioParameter.setShowInPanel(dto.showInPanel);

        return ioParameter;
    }

    /**
     * Creates or updates an IoParameter instance.
     */
    public static upsert(dto: IoParameterUpsertDomainDto): IoParameter {
        const ioParameter = new IoParameter();

        ioParameter.setExternalId(dto.externalId);
        ioParameter.setModelId(dto.modelId);
        ioParameter.setCaption(dto.caption);
        ioParameter.setName(dto.name);
        ioParameter.setParameterKey(dto.parameterKey);
        ioParameter.setMeasurementUnit(dto.measurementUnit);
        ioParameter.setIcon(dto.icon);
        ioParameter.setIsEvent(dto.isEvent);
        ioParameter.setShowInPanel(dto.showInPanel);

        return ioParameter;
    }

    //#endregion

    //#region Setters

    public setExternalId(value: string): void {
        this.externalId = value;
    }

    public setModelId(value: number): void {
        this.modelId = value;
    }

    public setCaption(value: string): void {
        this.caption = value;
    }

    public setName(value: string): void {
        this.name = value;
    }

    public setParameterKey(value: string): void {
        this.parameterKey = value;
    }

    public setMeasurementUnit(value: string): void {
        this.measurementUnit = value;
    }

    public setIcon(value: string): void {
        this.icon = value;
    }

    public setIsEvent(value: boolean): void {
        this.isEvent = value;
    }

    public setShowInPanel(value: boolean): void {
        this.showInPanel = value;
    }

    //#endregion

    //#region Getters

    public getExternalId(): string {
        return this.externalId;
    }

    public getModelId(): number {
        return this.modelId;
    }

    public getCaption(): string {
        return this.caption;
    }

    public getName(): string {
        return this.name;
    }

    public getParameterKey(): string {
        return this.parameterKey;
    }

    public getMeasurementUnit(): string {
        return this.measurementUnit;
    }

    public getIcon(): string {
        return this.icon;
    }

    public getIsEvent(): boolean {
        return this.isEvent;
    }

    public getShowInPanel(): boolean {
        return this.showInPanel;
    }

    //#endregion
}