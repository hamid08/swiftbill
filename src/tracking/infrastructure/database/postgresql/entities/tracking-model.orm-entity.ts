import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TrackingBrandOrmEntity } from './tracking-brand.orm-entity';
import { IoParameterOrmEntity } from './io-parameter.orm-entity';
import { TrackingDeviceOrmEntity } from './tracking-device.orm-entity';

@Entity('tracking_models', { schema: 'public' })
export class TrackingModelOrmEntity {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'caption' })
  caption?: string;

  @Column({ type: 'int', name: 'brand_id' })
  brandId: number;

  @ManyToOne(() => TrackingBrandOrmEntity, (brand) => brand.models)
  @JoinColumn({ name: 'brand_id', referencedColumnName: 'id' })
  brand: TrackingBrandOrmEntity;

  @Column({ type: 'text', nullable: true, name: 'supported_commands' })
  supportedCommands?: string; // Split by comma

  @Column({ type: 'boolean', default: false, name: 'is_mobile' })
  isMobile: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_supported_extension' })
  isSupportedExtension: boolean;

  @OneToMany(() => IoParameterOrmEntity, (ioParameter) => ioParameter.model)
  ioParameters: IoParameterOrmEntity[];

  @OneToMany(() => TrackingDeviceOrmEntity, (device) => device.model)
  trackingDevices: TrackingDeviceOrmEntity[];
}