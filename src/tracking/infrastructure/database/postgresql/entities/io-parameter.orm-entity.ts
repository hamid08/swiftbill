import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TrackingModelOrmEntity } from './tracking-model.orm-entity';
import { IoParameterValueOrmEntity } from './io-parameter-value.orm-entity';

@Entity('io_parameters', { schema: 'public' })
export class IoParameterOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar',length: 100, unique: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'caption' })
  caption?: string;

  @Column({ type: 'varchar', length: 100, name: 'parameter_key' })
  @Index()
  parameterKey: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'measurement_unit' })
  measurementUnit?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'icon' })
  icon?: string;

  @Column({ type: 'boolean', default: false, name: 'is_event' })
  isEvent: boolean;

  @Column({ type: 'boolean', default: false, name: 'show_in_panel' })
  showInPanel: boolean;

  @Column({ type: 'int', name: 'model_id' }) 
  @Index()
  modelId: number;

  @ManyToOne(() => TrackingModelOrmEntity, (model) => model.ioParameters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'model_id', referencedColumnName: 'id' })
  model: TrackingModelOrmEntity;

  @OneToMany(() => IoParameterValueOrmEntity, (ioParameterValue) => ioParameterValue.ioParameter)
  values: IoParameterValueOrmEntity[];
}