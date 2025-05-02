import { SelectItemDto } from "src/common";
import { TrackingBrand } from "./tracking-brand.entity";

export const TrackingBrandRepository = Symbol('TrackingBrandRepository').valueOf();
export interface TrackingBrandRepository {

    upsertTrackingBrands(brands: TrackingBrand[]): Promise<void>;
    getAllTrackingBrands(): Promise<TrackingBrand[]>;
    getTrackingBrandById(trackingBrandId: number): Promise<TrackingBrand | null>;
    getList(): Promise<SelectItemDto[]>;
}
