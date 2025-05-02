import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { IoParameterOrmEntity } from './io-parameter.orm-entity';

@Entity('io_parameter_values', { schema: 'public' })
@Unique('UQ_io_parameter_values_value_key_io_parameter_id', ['valueKey', 'ioParameterId'])
export class IoParameterValueOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'caption' })
  caption?: string;

  @Column({ type: 'varchar', length: 100, name: 'value_key' })
  valueKey: string; // Used for externalKey

  @Column({ type: 'int', name: 'io_parameter_id' })
  @Index()
  ioParameterId: number;

  @ManyToOne(() => IoParameterOrmEntity, (ioParameter) => ioParameter.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'io_parameter_id', referencedColumnName: 'id' })
  ioParameter: IoParameterOrmEntity;
}