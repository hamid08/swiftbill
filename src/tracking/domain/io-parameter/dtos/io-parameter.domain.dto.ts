import { IoParameterValue } from "../value-objects";

export interface IoParameterDomainDto {
    id: number;
    externalId: string;
    caption: string;
    name: string;
    parameterKey: string;
    measurementUnit: string;
    icon: string;
    isEvent: boolean;
    showInPanel: boolean;
    modelId: number;
}