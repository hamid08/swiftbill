import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { VehicleOrmEntity } from './vehicle.orm-entity';

@Entity('user_vehicle_accesses', { schema: 'public' })
export class UserVehicleAccessOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => UserOrmEntity, (user) => user.accessibleVehicles)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserOrmEntity;

  @Column({ type: 'int', name: 'vehicle_id' })
  vehicleId: number;

  @ManyToOne(() => VehicleOrmEntity, (vehicle) => vehicle.authorizedUsers)
  @JoinColumn({ name: 'vehicle_id', referencedColumnName: 'id' })
  vehicle: VehicleOrmEntity;
}