import { Injectable, Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AbstractRepository, GridViewDto } from 'src/common';
import {
  LocationType,
  MinimalLocationB1,
  TrackingDataHistoryDto,
  TrackingDataRepository,
  PublicTrackingDataResponseDto,
  TrackingPointType,
  ViolationTrackedRouteResponseDto,
  PublicTrackingDataDto,
  TimeSegment,
  TrackingDataHistoryTrackedRouteDto,
  MinimalLocationB2,
  TrackingDataHistoryTrackedRouteAttribute,
  TripTrackedRouteResponseDto,
  TrackingDataHistoryTrackedRouteSummaryDto,
  TrackingDataHistoryTrackedParameterDto
} from 'src/tracking/domain';
import { TrackingDataDocument } from '../schema';

@Injectable()
export class MongoTrackingDataRepository
  extends AbstractRepository<TrackingDataDocument>
  implements TrackingDataRepository {

  protected readonly logger = new Logger(MongoTrackingDataRepository.name);

  constructor(
    @InjectModel(TrackingDataDocument.name)
    private trackingDataModel: Model<TrackingDataDocument>,
    @InjectConnection() connection: Connection,
  ) {
    super(trackingDataModel, connection);
  }

  async getPublicTrackingDataWithImei(
    imei: string,
    pageIndex: number,
    pageSize: number,
    fromDate: Date,
    toDate: Date
  ): Promise<PublicTrackingDataResponseDto> {
    return this.getPublicTrackingData(
      { imei: { $eq: imei } },
      pageIndex,
      pageSize,
      fromDate,
      toDate
    );
  }

  async getPublicTrackingDataWithTerminalNumber(
    terminalNumber: string,
    pageIndex: number,
    pageSize: number,
    fromDate: Date,
    toDate: Date
  ): Promise<PublicTrackingDataResponseDto> {
    return this.getPublicTrackingData(
      { terminalNumber: { $eq: terminalNumber } },
      pageIndex,
      pageSize,
      fromDate,
      toDate
    );
  }


  //#region  Public Tracking Data
  async getPublicTrackingData(
    identifierCondition: any,
    pageIndex: number,
    pageSize: number,
    fromDate: Date,
    toDate: Date
  ): Promise<PublicTrackingDataResponseDto> {
    const dateCondition = {
      trafficDate: {
        $gte: fromDate,
        $lte: toDate
      }
    };

    const query = {
      $and: [
        identifierCondition,
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        MongoTrackingDataRepository.VALID_COORDINATES_CONDITION,
        MongoTrackingDataRepository.VALID_LOCATION_TYPE_CONDITION,
        dateCondition
      ]
    };

    const [records, total] = await Promise.all([
      this.findWithPaging(query, pageIndex, pageSize),
      this.trackingDataModel.countDocuments(query)
    ]);

    return {
      list: records.map(this.mapToPublicTrackingDataDto),
      page: pageIndex,
      total,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  private mapToPublicTrackingDataDto(record: TrackingDataDocument): PublicTrackingDataDto {
    return {
      date: record.trafficDate,
      locationType: record.locationType || LocationType.Valid,
      altitude: record.altitude,
      lng: record.longitude,
      lat: record.latitude,
      angle: record.angle,
      speed: record.speed,
      imei: record.imei,
    };
  }

  //#endregion

  //#region Data History
  async getDataHistory(
    terminalNumber: string,
    maxTimeBetweenTripInMinutes: number,
    maxDistanceBetweenPositionsInMeters: number,
    fromDate: Date,
    toDate: Date,
    fromTime?: string,
    toTime?: string,
    timeSegments: TimeSegment[] = []
  ): Promise<GridViewDto<TrackingDataHistoryDto>> {
    // If specific times are provided, ignore timeSegments and use these instead
    if (fromTime && toTime) {
      const [fromHour, fromMinute] = fromTime.split(':').map(Number);
      const [toHour, toMinute] = toTime.split(':').map(Number);

      timeSegments = [{
        fromHour: fromHour,
        toHour: toHour === 0 ? 24 : toHour,
        fromMinute: fromMinute,
        toMinute: toMinute
      } as TimeSegment];
    }

    // Base match conditions
    const baseMatch: any = {
      $and: [
        { terminalNumber },
        MongoTrackingDataRepository.VALID_COORDINATES_CONDITION,
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        MongoTrackingDataRepository.VALID_LOCATION_TYPE_CONDITION,
        {
          trafficDate: {
            $gte: fromDate,
            $lte: toDate
          }
        }
      ]
    };

    const results: TrackingDataHistoryDto[] = [];

    // Process each time segment
    for (const segment of timeSegments) {
      // Create precise time filtering
      const timeMatch = {
        $and: [
          ...baseMatch.$and,
          {
            $expr: {
              $and: [
                // Hour comparison
                { $gte: [{ $hour: "$trafficDate" }, segment.fromHour] },
                { $lt: [{ $hour: "$trafficDate" }, segment.toHour] },
                // Minute comparison for start time
                {
                  $or: [
                    { $gt: [{ $hour: "$trafficDate" }, segment.fromHour] }, // Hour is after start hour
                    {
                      $and: [
                        { $eq: [{ $hour: "$trafficDate" }, segment.fromHour] },
                        { $gte: [{ $minute: "$trafficDate" }, segment.fromMinute || 0] }
                      ]
                    }
                  ]
                },
                // Minute comparison for end time
                {
                  $or: [
                    { $lt: [{ $hour: "$trafficDate" }, segment.toHour] }, // Hour is before end hour
                    {
                      $and: [
                        { $eq: [{ $hour: "$trafficDate" }, segment.toHour] },
                        { $lte: [{ $minute: "$trafficDate" }, segment.toMinute || 59] }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ]
      };

      // Get all points sorted by date for this segment
      const allPoints = await this.trackingDataModel.find(timeMatch)
        .sort({ trafficDate: 1 })
        .lean();

      if (allPoints.length === 0) continue;

      // Group points by date (day)
      const pointsByDate = new Map<string, any[]>();
      allPoints.forEach(point => {
        const dateKey = point.trafficDate.toISOString().split('T')[0];
        if (!pointsByDate.has(dateKey)) {
          pointsByDate.set(dateKey, []);
        }
        pointsByDate.get(dateKey)?.push(point);
      });

      // Process each day's points
      for (const [date, dailyPoints] of pointsByDate) {
        if (dailyPoints.length === 0) continue;

        // Split into trips
        const trips = this.groupPointsIntoTrips(
          dailyPoints,
          maxTimeBetweenTripInMinutes,
          maxDistanceBetweenPositionsInMeters
        );

        // Calculate metrics
        const metrics = this.calculateTripMetrics(trips);

        const summary = new TrackingDataHistoryDto();
        summary.id = `${date}-${segment.fromHour}:${segment.fromMinute || '00'}-${segment.toHour}:${segment.toMinute || '00'}`;
        summary.startDate = metrics.startDate || new Date(date);
        summary.endDate = metrics.endDate || new Date(date);
        summary.operationHours = metrics.operationHours;
        summary.distanceKm = metrics.distance;
        summary.averageSpeedKmh = metrics.avgSpeed;

        results.push(summary);
      }
    }

    // Sort results by startDate
    results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return {
      list: results,
      page: 1,
      size: results.length,
      total: results.length
    };
  }

  private groupPointsIntoTrips(
    points: any[],
    maxTimeDiff: number,
    maxDistanceDiff: number
  ): any[][] {
    if (points.length === 0) return [];

    const trips: any[][] = [];
    let currentTrip = [points[0]];

    for (let i = 1; i < points.length; i++) {
      const prev = currentTrip[currentTrip.length - 1];
      const current = points[i];

      const timeDiff = (current.trafficDate.getTime() - prev.trafficDate.getTime()) / (1000 * 60);
      const distanceDiff = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        current.latitude,
        current.longitude
      );

      if (timeDiff > maxTimeDiff || distanceDiff > maxDistanceDiff) {
        trips.push(currentTrip);
        currentTrip = [current];
      } else {
        currentTrip.push(current);
      }
    }

    if (currentTrip.length > 0) {
      trips.push(currentTrip);
    }

    return trips;
  }

  // Helper method to calculate trip metrics
  private calculateTripMetrics(trips: any[][]): {
    distance: number;
    avgSpeed: number;
    operationHours: number;
    startDate: Date | null;
    endDate: Date | null;
  } {
    let totalDistance = 0;
    let speedSum = 0;
    let speedCount = 0;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    for (const trip of trips) {
      if (trip.length === 0) continue;

      // Update start and end dates
      if (!startDate || trip[0].trafficDate < startDate) {
        startDate = trip[0].trafficDate;
      }
      if (!endDate || trip[trip.length - 1].trafficDate > endDate) {
        endDate = trip[trip.length - 1].trafficDate;
      }

      // Calculate distance and speed
      for (let i = 1; i < trip.length; i++) {
        const prev = trip[i - 1];
        const current = trip[i];

        if (current.speed > 0) {
          const distance = this.calculateDistance(
            prev.latitude,
            prev.longitude,
            current.latitude,
            current.longitude
          );
          totalDistance += distance / 1000; // Convert to km
          speedSum += current.speed;
          speedCount++;
        }
      }
    }

    const operationHours = startDate && endDate
      ? (endDate.getTime() - startDate.getTime()) / (1000 * 3600)
      : 0;

    return {
      distance: parseFloat(totalDistance.toFixed(2)),
      avgSpeed: speedCount > 0 ? parseFloat((speedSum / speedCount).toFixed(2)) : 0,
      operationHours: parseFloat(operationHours.toFixed(2)),
      startDate,
      endDate
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  //#endregion

  //#region  Point Details
  async getPointDetails(terminalNumber: string, latitude: number, longitude: number): Promise<MinimalLocationB1 | null> {
    const query = {
      $and: [
        { terminalNumber: { $eq: terminalNumber } },
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        { latitude: { $eq: latitude }, longitude: { $eq: longitude } }
      ]
    };

    const options = {
      sort: { trafficDate: -1 } // Sort by trafficDate in descending order (newest first)
    };

    const record = await this.findOne(query, options);

    if (!record) {
      return null;
    }

    return this.mapToPointDetailsDto(record);
  }

  private mapToPointDetailsDto(record: TrackingDataDocument): MinimalLocationB1 {
    return {
      altitude: record.altitude,
      angle: record.angle,
      speed: record.speed,
      lat: record.latitude,
      lng: record.longitude,
      date: record.trafficDate
    };
  }
  //#endregion

  //#region  Public reusable query conditions
  private static readonly VALID_COORDINATES_CONDITION = {
    $and: [
      { latitude: { $nin: [0, null], $exists: true } },
      { longitude: { $nin: [0, null], $exists: true } }
    ]
  };

  private static readonly VALID_EXTENSION_CONDITION = {
    $or: [
      { extensionId: { $eq: null } },
      { extensionId: { $exists: false } }
    ]
  };

  private static readonly VALID_LOCATION_TYPE_CONDITION = {
    $or: [
      { locationType: { $exists: false } },
      { locationType: null },
      { locationType: { $in: [LocationType.Valid, LocationType.Missing] } }
    ]
  };

  //#endregion

  //#region  Violation Tracked Route Data
  async getViolationTrackedRouteData(
    pageIndex: number,
    pageSize: number,
    terminalNumber: string,
    fromDate: Date,
    toDate?: Date
  ): Promise<ViolationTrackedRouteResponseDto[]> {

    const dateCondition = toDate
      ? { trafficDate: { $gte: fromDate, $lte: toDate } }
      : { trafficDate: { $gte: fromDate } };

    const query = {
      $and: [
        { terminalNumber: { $eq: terminalNumber } },
        MongoTrackingDataRepository.VALID_COORDINATES_CONDITION,
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        MongoTrackingDataRepository.VALID_LOCATION_TYPE_CONDITION,
        dateCondition
      ]
    };

    const records = await this.findWithPaging(query, pageIndex, pageSize);

    return records.map(this.mapToViolationTrackedRouteDto);
  }

  private mapToViolationTrackedRouteDto(record: TrackingDataDocument): ViolationTrackedRouteResponseDto {
    return {
      id: record._id.toString(),
      trafficDate: record.trafficDate,
      locationType: record.locationType || LocationType.Valid,
      altitude: record.altitude,
      lng: record.longitude,
      lat: record.latitude,
      angle: record.angle,
      speed: record.speed,
      type: TrackingPointType.NormalPoint,
    };
  }
  //#endregion

  //#region  Trip Tracked Route Data
  async getTripTrackedRouteData(pageIndex: number, pageSize: number, terminalNumber: string, fromDate: Date, toDate?: Date | undefined): Promise<TripTrackedRouteResponseDto[]> {
    const dateCondition = toDate
      ? { trafficDate: { $gte: fromDate, $lte: toDate } }
      : { trafficDate: { $gte: fromDate } };

    const query = {
      $and: [
        { terminalNumber: { $eq: terminalNumber } },
        MongoTrackingDataRepository.VALID_COORDINATES_CONDITION,
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        MongoTrackingDataRepository.VALID_LOCATION_TYPE_CONDITION,
        dateCondition
      ]
    };

    const records = await this.findWithPaging(query, pageIndex, pageSize);

    return records.map(this.mapToTripTrackedRouteDto);
  }

  private mapToTripTrackedRouteDto(record: TrackingDataDocument): TripTrackedRouteResponseDto {
    return {
      id: record._id.toString(),
      trafficDate: record.trafficDate,
      locationType: record.locationType || LocationType.Valid,
      altitude: record.altitude,
      lng: record.longitude,
      lat: record.latitude,
      angle: record.angle,
      speed: record.speed,
      type: TrackingPointType.NormalPoint,
    };
  }
  //#endregion

  //#region  History Data Tracked Route
  async getDataHistoryTrackedRoute(
    fromDate: Date,
    toDate: Date,
    terminalNumber: string,
  ): Promise<TrackingDataHistoryTrackedRouteDto> {
    const dateCondition = { trafficDate: { $gte: fromDate, $lte: toDate } };

    const query = {
      $and: [
        { terminalNumber: { $eq: terminalNumber } },
        MongoTrackingDataRepository.VALID_COORDINATES_CONDITION,
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        MongoTrackingDataRepository.VALID_LOCATION_TYPE_CONDITION,
        dateCondition
      ]
    };

    // Get all points sorted by date
    const records = await this.trackingDataModel.find(query)
      .sort({ trafficDate: 1 })
      .lean();

    if (records.length === 0) {
      return {
        points: [],
        summaryDetail: [],
        duration: 0
      };
    }

    // Calculate metrics
    const metrics = this.calculateRouteMetrics(records);

    // Map to MinimalLocationB2 format
    const points = records.map(record => this.mapToMinimalLocationB2(record));

    // Prepare summary details
    const summaryDetail: TrackingDataHistoryTrackedRouteAttribute[] = [
      {
        key: 'مسافت کل',
        value: `${metrics.totalDistance.toFixed(2)} کیلومتر`
      },
      {
        key: 'مدت توقف',
        value: this.formatDuration(metrics.totalStopTime)
      },
      {
        key: 'ساعات کار',
        value: this.formatDuration(metrics.totalTrackedTime)
      },
      {
        key: 'زمان فعالیت',
        value: this.formatDuration(metrics.totalDuration)
      }
    ];

    return {
      points,
      summaryDetail,
      duration: metrics.totalDuration
    };
  }

  private calculateRouteMetrics(points: any[]): {
    totalDistance: number;
    totalStopTime: number; // in seconds
    totalTrackedTime: number; // in seconds
    totalDuration: number; // in seconds
  } {
    if (points.length === 0) {
      return {
        totalDistance: 0,
        totalStopTime: 0,
        totalTrackedTime: 0,
        totalDuration: 0
      };
    }

    let totalDistance = 0;
    let totalStopTime = 0;
    let movingTime = 0;
    const stopSpeedThreshold = 5; // km/h - consider below this as stopped

    // Calculate distance and movement times
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];

      // Calculate time difference in seconds
      const timeDiff = (current.trafficDate.getTime() - prev.trafficDate.getTime()) / 1000;

      // Calculate distance between points
      const distance = this.calculateDistance(
        prev.latitude,
        prev.longitude,
        current.latitude,
        current.longitude
      ) / 1000; // in km

      totalDistance += distance;

      // Determine if vehicle was moving or stopped
      if (current.speed < stopSpeedThreshold) {
        totalStopTime += timeDiff;
      } else {
        movingTime += timeDiff;
      }
    }

    // Total duration is from first to last point
    const totalDuration = (points[points.length - 1].trafficDate.getTime() -
      points[0].trafficDate.getTime()) / 1000;

    return {
      totalDistance,
      totalStopTime,
      totalTrackedTime: movingTime,
      totalDuration
    };
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private mapToMinimalLocationB2(record: TrackingDataDocument): MinimalLocationB2 {
    return {
      lat: record.latitude,
      lng: record.longitude,
      date: record.trafficDate,
      speed: record.speed,
      angle: record.angle,
      altitude: record.altitude,
      locationType: record.locationType || LocationType.Valid
    };
  }
  //#endregion

  //#region  History Data Tracked Parameter
  async getDataHistoryTrackedParameter(
    terminalNumber: string,
    parameterKey: string,
    fromDate: Date,
    toDate: Date
  ): Promise<TrackingDataHistoryTrackedParameterDto[]> {
    const dateCondition = {
      trafficDate: {
        $gte: fromDate,
        $lte: toDate
      }
    };

    const query = {
      $and: [
        { terminalNumber: { $eq: terminalNumber } },
        {
          ioElements: {
            $elemMatch: {
              key: parameterKey
            }
          }
        },
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        dateCondition
      ]
    };

    // Get all matching records sorted by date
    const records = await this.trackingDataModel.find(query)
      .sort({ trafficDate: 1 })
      .lean();

    if (records.length === 0) {
      return [];
    }

    // Extract parameter values with their timestamps
    const parameterHistory: TrackingDataHistoryTrackedParameterDto[] = [];

    records.forEach(record => {
      // Find the specific IO element matching our parameter key
      const parameterElement = record.ioElements?.find(io => io.key === parameterKey);

      if (parameterElement) {
        parameterHistory.push({
          value: parameterElement.value,
          dateTime: record.trafficDate
        });
      }
    });

    return parameterHistory;
  }

  //#endregion

  //#region Tracked Route Summary
  async getDataHistoryTrackedRouteSummary(
    fromDate: Date,
    toDate: Date,
    terminalNumber: string,
  ): Promise<TrackingDataHistoryTrackedRouteSummaryDto> {
    const dateCondition = { trafficDate: { $gte: fromDate, $lte: toDate } };

    const query = {
      $and: [
        { terminalNumber: { $eq: terminalNumber } },
        MongoTrackingDataRepository.VALID_COORDINATES_CONDITION,
        MongoTrackingDataRepository.VALID_EXTENSION_CONDITION,
        MongoTrackingDataRepository.VALID_LOCATION_TYPE_CONDITION,
        dateCondition
      ]
    };

    // Get all points sorted by date
    const records = await this.trackingDataModel.find(query)
      .sort({ trafficDate: 1 })
      .lean();

    if (records.length === 0) {
      return {
        summaryDetail: [
          {
            key: 'مسافت کل',
            value: '0 کیلومتر'
          },
          {
            key: 'مدت توقف',
            value: '00:00:00'
          },
          {
            key: 'ساعات کار',
            value: '00:00:00'
          },
          {
            key: 'زمان فعالیت',
            value: '00:00:00'
          }
        ],
        duration: 0
      };
    }

    // Calculate metrics
    const metrics = this.calculateRouteMetrics(records);

    // Prepare summary details
    const summaryDetail: TrackingDataHistoryTrackedRouteAttribute[] = [
      {
        key: 'مسافت کل',
        value: `${metrics.totalDistance.toFixed(2)} کیلومتر`
      },
      {
        key: 'مدت توقف',
        value: this.formatDuration(metrics.totalStopTime)
      },
      {
        key: 'ساعات کار',
        value: this.formatDuration(metrics.totalTrackedTime)
      },
      {
        key: 'زمان فعالیت',
        value: this.formatDuration(metrics.totalDuration)
      }
    ];

    return {
      summaryDetail,
      duration: metrics.totalDuration
    };
  }
  //#endregion
}