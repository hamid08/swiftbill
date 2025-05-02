import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BusinessOrmEntity } from './business.orm-entity';
import { PlaqueStatus, PlaqueType } from 'src/tracking/domain';
import { TrackerOrmEntity } from './tracker.orm-entity';
import { UserVehicleAccessOrmEntity } from './user-vehicle-access.orm-entity';

@Entity('vehicles', { schema: 'public' })
export class VehicleOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'name' })
  name?: string;

  @Column({ type: 'varchar', length: 100, name: 'identity' })
  identity: string;

  @Column({ type: 'smallint', enum: PlaqueStatus, name: 'plaque_status' })
  plaqueStatus: PlaqueStatus;

  @Column({ type: 'smallint', enum: PlaqueType, name: 'plaque_type', nullable: true })
  plaqueType?: PlaqueType;

  @Column({ type: 'varchar', length: 150, nullable: true, name: 'plaque_no' })
  plaqueNo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'vehicle_model_name' })
  vehicleModelName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'vehicle_model_id' })
  vehicleModelId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'user_type_name' })
  userTypeName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'user_type_id' })
  userTypeId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'company_name' })
  companyName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'image' })
  image?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'imei' })
  imei?: string;

  @Column({ type: 'int', name: 'business_id' })
  @Index()
  businessId: number;

  @ManyToOne(() => BusinessOrmEntity, (business) => business.vehicles)
  @JoinColumn({ name: 'business_id', referencedColumnName: 'id' })
  business: BusinessOrmEntity;

  @OneToMany(() => UserVehicleAccessOrmEntity, (userVehicleAccess) => userVehicleAccess.vehicle)
  authorizedUsers: UserVehicleAccessOrmEntity[];

  @Column({ type: 'int', nullable: true, name: 'tracker_id' })
  trackerId?: number;

  @OneToOne(() => TrackerOrmEntity, (tracker) => tracker.vehicle, { nullable: true })
  @JoinColumn({ name: 'tracker_id', referencedColumnName: 'id' })
  tracker?: TrackerOrmEntity;
}