import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { TrackingModelOrmEntity } from './tracking-model.orm-entity';

@Entity('tracking_brands', { schema: 'public' })
export class TrackingBrandOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar',length: 100, unique: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  caption?: string;

  @Column({ type: 'boolean', default: false, name: 'is_mobile' })
  isMobile: boolean;

  @OneToMany(() => TrackingModelOrmEntity, (model) => model.brand)
  models: TrackingModelOrmEntity[];
}