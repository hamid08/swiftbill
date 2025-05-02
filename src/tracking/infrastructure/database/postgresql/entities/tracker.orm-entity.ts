import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, ManyToOne, JoinColumn, OneToOne, Point } from 'typeorm';
import { BusinessOrmEntity } from './business.orm-entity';
import { VehicleOrmEntity } from './vehicle.orm-entity';
import { TrackerType } from 'src/tracking/domain';
import { TrackerAssignmentOrmEntity } from './tracker-assignment.orm-entity';
import { TripOrmEntity } from './trip.orm-entity';
import { appDateTransformer } from '../transformers';

@Entity('trackers', { schema: 'public' })
@Index(['businessId', 'lastTrackedAt']) // Composite B-tree index
@Index(['vehicleId', 'lastTrackedAt'])  // Composite B-tree index
export class TrackerOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'smallint', enum: TrackerType, name: 'type' })
  @Index() // B-tree index for type filtering
  type: TrackerType;

  @Column({ type: 'integer', name: 'business_id' })
  @Index() // B-tree index for business ID
  businessId: number;

  @ManyToOne(() => BusinessOrmEntity, (business) => business.trackers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id', referencedColumnName: 'id' })
  business: BusinessOrmEntity;

  @Column({ type: 'integer', nullable: true, name: 'vehicle_id' })
  @Index() // B-tree index for vehicle ID
  vehicleId?: number;

  @OneToOne(() => VehicleOrmEntity, (vehicle) => vehicle.tracker, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vehicle_id', referencedColumnName: 'id' })
  vehicle?: VehicleOrmEntity;

  @Column({ type: 'timestamp', name: 'last_tracked_at', nullable: true, transformer: appDateTransformer })
  @Index() // B-tree index for online status
  lastTrackedAt?: Date;

  @Column({ type: 'timestamp', name: 'last_connected_at', nullable: true, transformer: appDateTransformer })
  lastConnectedAt?: Date;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    name: 'location',
    // precision:10000,
    nullable: true
  })
  @Index({ spatial: true }) // GiST index only for location
  location?: Point;

  @Column({ type: 'float', name: 'angle', nullable: true })
  angle?: number;

  @Column({ type: 'float', name: 'altitude', nullable: true })
  altitude?: number;

  @Column({ type: 'float', name: 'speed', nullable: true })
  @Index() // B-tree index if you filter by speed ranges
  speed?: number;

  @OneToMany(() => TrackerAssignmentOrmEntity, (trackerAssignment) => trackerAssignment.tracker)
  trackerAssignments: TrackerAssignmentOrmEntity[];

  @OneToMany(() => TripOrmEntity, (trip) => trip.tracker)
  trips: TripOrmEntity[];
}