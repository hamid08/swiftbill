import { SelectItemDto } from "src/common";
import { TrackingModel } from "./tracking-model.entity";
import { TrackingDeviceSupportedCommandDto } from "../tracking-device";

export const TrackingModelRepository = Symbol(
    'TrackingModelRepository',
).valueOf();
export interface TrackingModelRepository {

    upsertTrackingModels(models: TrackingModel[]): Promise<void>;
    getAllTrackingModels(): Promise<TrackingModel[]>;
    getMobileModelId(): Promise<number | null>;
    getMobileModel(): Promise<TrackingModel | null>;
    getList(trackingBrandId:number):Promise<SelectItemDto[]>;
    getTrackingModelById(trackingModelId: number): Promise<TrackingModel | null>;
    getTrackingModelByExternalId(externalId: string): Promise<TrackingModel | null>;
    getSupportedCommands(trackingModelId: number): Promise<TrackingDeviceSupportedCommandDto>;
}
