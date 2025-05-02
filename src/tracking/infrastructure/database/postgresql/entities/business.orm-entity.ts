import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { VehicleOrmEntity } from './vehicle.orm-entity';
import { TrackingDeviceOrmEntity } from './tracking-device.orm-entity';
import { TrackerOrmEntity } from './tracker.orm-entity';

@Entity('businesses', { schema: 'public' })
export class BusinessOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar',length: 100, unique: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 255, name: 'display_name' })
  displayName: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'icon' })
  icon?: string;

  @OneToMany(() => VehicleOrmEntity, vehicle => vehicle.business)
  vehicles: VehicleOrmEntity[];

  @OneToMany(() => TrackingDeviceOrmEntity, trackingDevice => trackingDevice.business)
  trackingDevices: TrackingDeviceOrmEntity[];

  @OneToMany(() => TrackerOrmEntity, tracker => tracker.business)
  trackers: TrackerOrmEntity[];
}