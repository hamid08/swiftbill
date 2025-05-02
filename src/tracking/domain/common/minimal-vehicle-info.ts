import { PlaqueType, PlaqueStatus } from "../enums";

export class MinimalVehicleInfo {
    id: number;
    plaqueNo: string;
    plaqueType: PlaqueType;
    plaqueStatus: PlaqueStatus;
    name: string;
}
