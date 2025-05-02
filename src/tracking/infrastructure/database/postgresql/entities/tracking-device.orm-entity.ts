import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessOrmEntity } from './business.orm-entity';
import { ActiveStatus } from 'src/tracking/domain';
import { TrackingModelOrmEntity } from './tracking-model.orm-entity';
import { TrackingExtensionOrmEntity } from './tracking-extension.orm-entity';
import { TrackerAssignmentOrmEntity } from './tracker-assignment.orm-entity';

@Entity('tracking_devices', { schema: 'public' })
export class TrackingDeviceOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'imei' })
  @Index()
  imei: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'serial_number' })
  serialNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'sim_number' })
  simNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'remote_password' })
  remotePassword?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'identity' })
  identity?: string;

  @Column({ type: 'smallint', enum: ActiveStatus, name: 'active_status' })
  activeStatus: ActiveStatus;

  @Column({ type: 'int', name: 'model_id' })
  modelId: number;

  @ManyToOne(() => TrackingModelOrmEntity, (model) => model.trackingDevices)
  @JoinColumn({ name: 'model_id', referencedColumnName: 'id' })
  model: TrackingModelOrmEntity;

  @Column({ type: 'int', name: 'business_id' })
  businessId: number;

  @ManyToOne(() => BusinessOrmEntity, (business) => business.trackingDevices)
  @JoinColumn({ name: 'business_id', referencedColumnName: 'id' })
  business: BusinessOrmEntity;

  @OneToMany(() => TrackerAssignmentOrmEntity, (trackerAssignment) => trackerAssignment.trackingDevice)
  trackerAssignments: TrackerAssignmentOrmEntity[];

  @OneToMany(() => TrackingExtensionOrmEntity, (trackingExtension) => trackingExtension.trackingDevice)
  extensions: TrackingExtensionOrmEntity[];
}