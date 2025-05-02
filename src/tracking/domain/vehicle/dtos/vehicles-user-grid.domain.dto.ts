import { PlaqueStatus, PlaqueType } from "../../enums";

export class VehiclesUserGridResponseDto {
    id: number;
    identity: string;
    plaqueStatus: PlaqueStatus;
    plaqueType: PlaqueType;
    plaqueNo?: string;
}

