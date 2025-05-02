import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, JoinColumn, Unique } from 'typeorm';
import { TrackingDeviceOrmEntity } from './tracking-device.orm-entity';
import { TrackerOrmEntity } from './tracker.orm-entity';
import { TrackerLatestDataOrmEntity } from './tracker-latest-data.orm-entity';
import { TrackingEventOrmEntity } from './tracking-event.orm-entity';
import { ViolationOrmEntity } from './violation.orm-entity';
import { appDateTransformer } from '../transformers';

@Entity('tracker_assignments', { schema: 'public' })
export class TrackerAssignmentOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'terminal_number', unique: true }) // Unique constraint + index
  terminalNumber: string;

  @Column({ type: 'boolean', name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'timestamp', name: 'start_date', transformer: appDateTransformer })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date', transformer: appDateTransformer })
  endDate?: Date;

  @Column({ type: 'int', name: 'tracking_device_id' })
  @Index()
  trackingDeviceId: number;

  @ManyToOne(() => TrackingDeviceOrmEntity, (trackingDevice) => trackingDevice.trackerAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tracking_device_id', referencedColumnName: 'id' })
  trackingDevice: TrackingDeviceOrmEntity;

  @Column({ type: 'int', name: 'tracker_id' })
  @Index()
  trackerId: number;

  @ManyToOne(() => TrackerOrmEntity, (tracker) => tracker.trackerAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tracker_id', referencedColumnName: 'id' })
  tracker: TrackerOrmEntity;

  @OneToMany(() => TrackerLatestDataOrmEntity, (trackerLatestData) => trackerLatestData.trackerAssignment)
  latestData: TrackerLatestDataOrmEntity[];

  @OneToMany(() => TrackingEventOrmEntity, (trackingEvent) => trackingEvent.trackerAssignment)
  events: TrackingEventOrmEntity[];

  @OneToMany(() => ViolationOrmEntity, (violation) => violation.trackerAssignment)
  violations: ViolationOrmEntity[];
}