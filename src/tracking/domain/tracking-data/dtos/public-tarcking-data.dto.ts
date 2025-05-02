import { LocationType } from "../tracking-data.enum";

export class PublicTrackingDataResponseDto {
  list: PublicTrackingDataDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class PublicTrackingDataDto {
  imei: string;
  altitude: number;
  angle: number;
  speed: number;
  lat: number;
  lng: number;
  date?: Date;
  locationType: LocationType;
}
