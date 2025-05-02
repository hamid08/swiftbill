import { ViolationLocationType } from 'src/tracking/domain';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Point } from 'typeorm';
import { ViolationOrmEntity } from './violation.orm-entity';
import { appDateTransformer } from '../transformers';

@Entity('violation_locations', { schema: 'public' })
export class ViolationLocationOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, name: 'location' })
  location: Point;

  @Column({ type: 'float', nullable: true  })
  angle?: number;

  @Column({ type: 'float', nullable: true  })
  altitude?: number;

  @Column({ type: 'float', nullable: true  })
  speed?: number;

  @Column({ type: 'timestamp', name: 'occurred_at', transformer: appDateTransformer })
  occurredAt: Date;

  @Column({ type: 'smallint', enum: ViolationLocationType, name: 'location_type' })
  locationType: ViolationLocationType;

  @Column({ type: 'int', name: 'violation_id' })
  violationId: number;

  @ManyToOne(() => ViolationOrmEntity, (violation) => violation.locations)
  @JoinColumn({ name: 'violation_id', referencedColumnName: 'id' })
  violation: ViolationOrmEntity;
}