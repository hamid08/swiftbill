import { ValueObject } from "src/common";
import { IoParameterValueDomainDto, IoParameterValueUpsertDomainDto } from "./dtos";

export class IoParameterValue extends ValueObject {
    private name: string;
    private caption?: string;
    private valueKey: string;//user for externalKey
    private ioParameterId: number;

    private constructor() {
        super();
    }

    //#region Primary Operation

    public static mapToDomain(dto: IoParameterValueDomainDto): IoParameterValue {
        const ioParameterValue = new IoParameterValue();

        ioParameterValue.setId(dto.id); 
        ioParameterValue.setName(dto.name);
        ioParameterValue.setCaption(dto.caption);
        ioParameterValue.setValueKey(dto.valueKey);
        ioParameterValue.setIoParameterId(dto.ioParameterId);

        return ioParameterValue;
    }

    public static upsert(dto: IoParameterValueUpsertDomainDto): IoParameterValue {
        const ioParameterValue = new IoParameterValue();

        ioParameterValue.setName(dto.name);
        ioParameterValue.setCaption(dto.caption);
        ioParameterValue.setValueKey(dto.valueKey);
        ioParameterValue.setIoParameterId(dto.ioParameterId);

        return ioParameterValue;
    }

    //#endregion

    //#region Setters

    public setName(value: string): void {
        this.name = value;
    }

    public setCaption(value: string): void {
        this.caption = value;
    }

    public setValueKey(value: string): void {
        this.valueKey = value;
    }

    public setIoParameterId(value: number): void {
        this.ioParameterId = value;
    }

    //#endregion

    //#region Getters

    public getName(): string {
        return this.name;
    }

    public getCaption(): string | undefined {
        return this.caption;
    }

    public getValueKey(): string {
        return this.valueKey;
    }

    public getIoParameterId(): number {
        return this.ioParameterId;
    }

    //#endregion
}