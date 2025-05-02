import { ViolationType } from 'src/tracking/domain';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, JoinColumn } from 'typeorm';
import { TrackerAssignmentOrmEntity } from './tracker-assignment.orm-entity';
import { ViolationLocationOrmEntity } from './violation-location.orm-entity';
import { appDateTransformer } from '../transformers';

@Entity('violations', { schema: 'public' })
export class ViolationOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'smallint', enum: ViolationType })
  type: ViolationType;

  @Column({ type: 'timestamp', name: 'register_date', transformer: appDateTransformer })
  registerDate: Date;

  @Column({ type: 'timestamp', name: 'start_date', transformer: appDateTransformer })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date', transformer: appDateTransformer })
  endDate?: Date;


  @Column({ type: 'int', name: 'tracker_assignment_id' })
  @Index()
  trackerAssignmentId: number;


  @ManyToOne(() => TrackerAssignmentOrmEntity, (trackerAssignment) => trackerAssignment.violations)
  @JoinColumn({ name: 'tracker_assignment_id', referencedColumnName: 'id' })
  trackerAssignment: TrackerAssignmentOrmEntity;

  @OneToMany(() => ViolationLocationOrmEntity, (violationLocation) => violationLocation.violation)
  locations: ViolationLocationOrmEntity[];
}