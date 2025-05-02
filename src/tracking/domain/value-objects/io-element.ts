import { ValueObject } from "src/common";

export class IoElement extends ValueObject {
    private readonly key: string;
    private readonly value: string;

    private constructor(key: string, value: string) {
        super();
        this.key = key;
        this.value = value;
    }

    public static create(key: string, value: string): IoElement {
        return new IoElement(key, value);
    }

    public getKey(): string {
        return this.key;
    }

    public getValue(): string {
        return this.value;
    }

    public toString(): string {
        return `IoElement { key: "${this.key}", value: "${this.value}" }`;
    }
}
