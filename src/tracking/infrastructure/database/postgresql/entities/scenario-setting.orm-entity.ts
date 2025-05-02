import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('scenario_settings', { schema: 'public' })
export class ScenarioSettingOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'integer', name: 'daily_rental_fee' })
  dailyRentalFee: number;

  @Column({ type: 'integer', name: 'day_start_hour' })
  dayStartHour: number;

  @Column({ type: 'integer', name: 'day_end_hour' })
  dayEndHour: number;

  @Column({ type: 'integer', name: 'max_overstaying_duration_day_in_minutes' })
  maxOverstayingDurationDayInMinutes: number;

  @Column({ type: 'integer', name: 'max_overstaying_duration_night_in_minutes' })
  maxOverstayingDurationNightInMinutes: number;

  @Column({ type: 'integer', name: 'allowed_stop_time_in_stop_forbidden_area_in_minutes' })
  allowedStopTimeInStopForbiddenAreaInMinutes: number;
}