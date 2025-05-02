import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, Point } from 'typeorm';
import { TrackerAssignmentOrmEntity } from './tracker-assignment.orm-entity';
import { TrackingExtensionOrmEntity } from './tracking-extension.orm-entity';
import { TrackerDataParameterOrmEntity } from './tracker-data-parameter.orm-entity';
import { appDateTransformer } from '../transformers';


@Entity('tracker_latest_data', { schema: 'public' })
export class TrackerLatestDataOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'timestamp', name: 'last_tracked_at', transformer: appDateTransformer })
  lastTrackedAt: Date;

  @Column({ type: 'timestamp', name: 'last_connected_at', transformer: appDateTransformer })
  lastConnectedAt: Date;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, name: 'location' })
  location: Point;

  @Column({ type: 'float', name: 'angle', nullable: true })
  angle?: number;

  @Column({ type: 'float', name: 'altitude', nullable: true })
  altitude?: number;

  @Column({ type: 'float', name: 'speed', nullable: true })
  speed?: number;

  @Column({ type: 'integer', name: 'tracker_assignment_id' })
  @Index()
  trackerAssignmentId: number;

  @ManyToOne(() => TrackerAssignmentOrmEntity, (trackerAssignment) => trackerAssignment.latestData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tracker_assignment_id', referencedColumnName: 'id' })
  trackerAssignment: TrackerAssignmentOrmEntity;

  @Column({ type: 'integer', nullable: true, name: 'extension_id' })
  extensionId?: number;

  @ManyToOne(() => TrackingExtensionOrmEntity, (trackingExtension) => trackingExtension.latestData, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'extension_id', referencedColumnName: 'id' })
  extension: TrackingExtensionOrmEntity;

  @OneToMany(() => TrackerDataParameterOrmEntity, (trackerDataParameter) => trackerDataParameter.trackerLatestData)
  parameters: TrackerDataParameterOrmEntity[];
}