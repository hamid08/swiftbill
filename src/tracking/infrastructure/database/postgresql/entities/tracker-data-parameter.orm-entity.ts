import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TrackerLatestDataOrmEntity } from './tracker-latest-data.orm-entity';
import { IoParameterOrmEntity } from './io-parameter.orm-entity';

@Entity('tracker_data_parameter', { schema: 'public' })
export class TrackerDataParameterOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', name: 'tracker_latest_data_id' })
  @Index()
  trackerLatestDataId: number;

  @ManyToOne(() => TrackerLatestDataOrmEntity, (trackerLatestData) => trackerLatestData.parameters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tracker_latest_data_id', referencedColumnName: 'id' })
  trackerLatestData: TrackerLatestDataOrmEntity;

  @Column({ type: 'int', name: 'io_parameter_id' })
  @Index()
  ioParameterId: number;

  @ManyToOne(() => IoParameterOrmEntity, (ioParameter) => ioParameter.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'io_parameter_id', referencedColumnName: 'id' })
  ioParameter: IoParameterOrmEntity;

  @Column({ type: 'varchar', name: 'io_parameter_value' })
  ioParameterValue: string;
}