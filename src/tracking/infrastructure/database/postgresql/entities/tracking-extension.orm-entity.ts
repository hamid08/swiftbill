import { TrackingExtensionStatus } from 'src/tracking/domain';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { TrackingDeviceOrmEntity } from './tracking-device.orm-entity';
import { TrackerLatestDataOrmEntity } from './tracker-latest-data.orm-entity';
import { TrackingEventOrmEntity } from './tracking-event.orm-entity';
import { appDateTransformer } from '../transformers';

@Entity('tracking_extensions', { schema: 'public' })
export class TrackingExtensionOrmEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'extension_id' })
  @Index('IDX_TRACKING_EXTENSION_EXTENSION_ID', { unique: true })
  extensionId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'caption' })
  caption?: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @Column({ type: 'smallint', enum: TrackingExtensionStatus, name: 'status' })
  status: TrackingExtensionStatus;

  @Column({ type: 'timestamp', name: 'updated_at', transformer: appDateTransformer })
  updateAt: Date;

  @Column({ type: 'int', name: 'device_id' })
  @Index()
  deviceId: number;

  @ManyToOne(() => TrackingDeviceOrmEntity, (trackingDevice) => trackingDevice.extensions)
  @JoinColumn({ name: 'device_id', referencedColumnName: 'id' })
  trackingDevice: TrackingDeviceOrmEntity;

  @OneToMany(() => TrackingEventOrmEntity, (trackingEvent) => trackingEvent.trackingExtension)
  events: TrackingEventOrmEntity[];

  @OneToMany(() => TrackerLatestDataOrmEntity, (trackerLatestData) => trackerLatestData.extension)
  latestData: TrackerLatestDataOrmEntity[];
}