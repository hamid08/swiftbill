import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, OneToMany, LineString } from 'typeorm';
import { TrackerOrmEntity } from './tracker.orm-entity';
import { TripCreationService } from 'src/tracking/domain';
import { TripAreaOrmEntity } from './trip-area.orm-entity';
import { appDateTransformer } from '../transformers';

@Entity('trips', { schema: 'public' })
export class TripOrmEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'caption' })
    caption?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'trip_number' })
    tripNumber?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'driver_name' })
    driverName?: string;

    @Column({ type: 'int', unsigned: true, default: 10, name: 'max_geofence_breaches' })
    maxGeofenceBreaches: number;

    @Column({ type: 'float', nullable: true, name: 'duration' })
    duration?: number;

    @Column({ type: 'smallint', enum: TripCreationService, name: 'creation_service', default: TripCreationService.TrackingControl })
    creationService: TripCreationService;

    @Column({ type: 'timestamp', name: 'start_date', transformer: appDateTransformer })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'end_date', transformer: appDateTransformer })
    endDate?: Date;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'LineString', // Specify the geometry type as LineString
        srid: 4326, // SRID for WGS 84 (GPS coordinates)
        name: 'path',
    })
    path: LineString;

    @Column({ type: 'int', name: 'tracker_id' })
    @Index()
    trackerId: number;

    @ManyToOne(() => TrackerOrmEntity, (tracker) => tracker.trackerAssignments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tracker_id', referencedColumnName: 'id' })
    tracker: TrackerOrmEntity;

    @OneToMany(() => TripAreaOrmEntity, (area) => area.trip)
    areas: TripAreaOrmEntity[];
}