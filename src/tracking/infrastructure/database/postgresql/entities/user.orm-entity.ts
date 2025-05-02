import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { UserVehicleAccessOrmEntity } from './user-vehicle-access.orm-entity';
import { appDateTransformer } from '../transformers';

@Entity('users', { schema: 'public' })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'name' }) // Added name column
  name?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'display_name' })
  displayName?: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'username' })
  username: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at', transformer: appDateTransformer })
  updatedAt: Date;

  @Column({ type: 'bool', default: false, name: 'access_to_all_vehicles' })
  accessToAllVehicles: boolean;

  @Column({ type: 'varchar', length: 255, name: 'business_external_ids' })
  businessExternalIds: string; //Note: this is a comma separated list of business external ids

  @OneToMany(() => UserVehicleAccessOrmEntity, (userVehicleAccess) => userVehicleAccess.user)
  accessibleVehicles: UserVehicleAccessOrmEntity[];
}