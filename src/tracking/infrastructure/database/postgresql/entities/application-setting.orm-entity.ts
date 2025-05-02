import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('application_settings', { schema: 'public' })
export class ApplicationSettingOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', unsigned: true, default: 10, name: 'max_time_between_trip_in_minutes' })
  maxTimeBetweenTripInMinutes: number;

  @Column({ type: 'int', unsigned: true, default: 500, name: 'max_distance_between_positions_in_meters' })
  maxDistanceBetweenPositionsInMeters: number;

  @Column({ type: 'int', unsigned: true, default: 5, name: 'min_time_to_detect_connected_tracker' })
  minTimeToDetectConnectedTracker: number;

  @Column({ type: 'int', unsigned: true, default: 30, name: 'max_overspeed_duration_seconds' })
  maxOverspeedDurationSeconds: number;

  @Column({ type: 'int', unsigned: true, default: 20, name: 'min_allowed_speed_km_per_hour' })
  minAllowedSpeedKmPerHour: number;

  @Column({ type: 'int', unsigned: true, default: 120, name: 'fault_data_max_allowed_speed_km_per_hour' })
  faultDataMaxAllowedSpeedKmPerHour: number;

  @Column({ type: 'int', unsigned: true, default: 1, name: 'fault_data_min_point_distance_km' }) // Changed to int
  faultDataMinPointDistanceKm: number;

  @Column({ type: 'int', unsigned: true, default: 15, name: 'missing_data_detection_time_minutes' })
  missingDataDetectionTimeMinutes: number;
}