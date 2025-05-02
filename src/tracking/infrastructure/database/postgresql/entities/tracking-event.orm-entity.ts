import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn, Point } from 'typeorm';
import { TrackerAssignmentOrmEntity } from './tracker-assignment.orm-entity';
import { IoParameterOrmEntity } from './io-parameter.orm-entity';
import { TrackingExtensionOrmEntity } from './tracking-extension.orm-entity';
import { TrackingEventLevel } from 'src/tracking/domain';
import { appDateTransformer } from '../transformers';

@Entity('tracking_events', { schema: 'public' })
export class TrackingEventOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'geography',
    nullable: true,
    spatialFeatureType: 'Point',
    srid: 4326,
    name: 'location',
    precision: 10000,
  })
  location?: Point;

  @Column({ type: 'float', nullable: true, name: 'angle' })
  angle?: number;

  @Column({ type: 'float', nullable: true, name: 'altitude' })
  altitude?: number;

  @Column({ type: 'float', nullable: true, name: 'speed' })
  speed?: number;

  @Column({ type: 'timestamp', name: 'occurred_at', transformer: appDateTransformer })
  @Index()
  occurredAt: Date;

  @Column({ type: 'smallint', enum: TrackingEventLevel, name: 'level' })
  level: TrackingEventLevel;

  @Column({ type: 'boolean', default: false, name: 'is_seen' })
  isSeen: boolean;

  @Column({ type: 'int', name: 'tracker_assignment_id' })
  @Index()
  trackerAssignmentId: number;

  @ManyToOne(() => TrackerAssignmentOrmEntity, (trackerAssignment) => trackerAssignment.events)
  @JoinColumn({ name: 'tracker_assignment_id', referencedColumnName: 'id' })
  trackerAssignment: TrackerAssignmentOrmEntity;

  @Column({ type: 'int', name: 'io_parameter_id' })
  ioParameterId: number;

  @ManyToOne(() => IoParameterOrmEntity, (ioParameter) => ioParameter.values)
  @JoinColumn({ name: 'io_parameter_id', referencedColumnName: 'id' })
  ioParameter: IoParameterOrmEntity;

  @Column({ type: 'varchar', name: 'io_parameter_value' })
  ioParameterValue: string;

  @Column({ type: 'int', nullable: true, name: 'tracking_extension_id' })
  @Index()
  trackingExtensionId?: number;

  @ManyToOne(() => TrackingExtensionOrmEntity, (trackingExtension) => trackingExtension.events)
  @JoinColumn({ name: 'tracking_extension_id', referencedColumnName: 'id' })
  trackingExtension: TrackingExtensionOrmEntity;
}