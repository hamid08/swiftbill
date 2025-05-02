import { MinimalLocationB1, PublicTrackingDataResponseDto, TripTrackedRouteResponseDto } from "src/tracking";
import { ViolationTrackedRouteResponseDto } from "../violation";
import { TimeSegment, TrackingDataHistoryDto, TrackingDataHistoryTrackedParameterDto, TrackingDataHistoryTrackedRouteDto, TrackingDataHistoryTrackedRouteSummaryDto } from "./dtos";
import { GridViewDto } from "src/common";
export const TrackingDataRepository = Symbol(
  'TrackingDataRepository',
).valueOf();
export interface TrackingDataRepository {

  getViolationTrackedRouteData(
    pageIndex: number,
    pageSize: number,
    terminalNumber: string,
    fromDate: Date,
    toDate?: Date | undefined
  ):
    Promise<ViolationTrackedRouteResponseDto[]>;

  getTripTrackedRouteData(
    pageIndex: number,
    pageSize: number,
    terminalNumber: string,
    fromDate: Date,
    toDate?: Date | undefined
  ):
    Promise<TripTrackedRouteResponseDto[]>;

  getPointDetails(terminalNumber: string, latitude: number, longitude: number): Promise<MinimalLocationB1 | null>;

  getDataHistory(
    terminalNumber: string,
    maxTimeBetweenTripInMinutes: number,
    maxDistanceBetweenPositionsInMeters: number,
    fromDate: Date,
    toDate: Date,
    fromTime?: string,
    toTime?: string,
    timeSegments?: TimeSegment[]
  ): Promise<GridViewDto<TrackingDataHistoryDto>>;

  getDataHistoryTrackedRoute(
    fromDate: Date,
    toDate: Date,
    terminalNumber: string,
  ): Promise<TrackingDataHistoryTrackedRouteDto>;

  getDataHistoryTrackedParameter(
    terminalNumber: string,
    parameterKey: string,
    fromDate: Date,
    toDate: Date
  ): Promise<TrackingDataHistoryTrackedParameterDto[]>

  getPublicTrackingDataWithImei(
    imei: string,
    pageIndex: number,
    pageSize: number,
    fromDate: Date,
    toDate: Date
  ): Promise<PublicTrackingDataResponseDto>;

  getPublicTrackingDataWithTerminalNumber(
    terminalNumber: string,
    pageIndex: number,
    pageSize: number,
    fromDate: Date,
    toDate: Date
  ): Promise<PublicTrackingDataResponseDto>;

  getDataHistoryTrackedRouteSummary(
    fromDate: Date,
    toDate: Date,
    terminalNumber: string,
  ): Promise<TrackingDataHistoryTrackedRouteSummaryDto>;

}
