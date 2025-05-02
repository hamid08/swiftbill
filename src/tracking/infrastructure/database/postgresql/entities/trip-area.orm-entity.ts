import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, Geometry } from 'typeorm';
import { TripAreaType } from 'src/tracking/domain';
import { TripOrmEntity } from './trip.orm-entity';

@Entity('trip_areas', { schema: 'public' })
export class TripAreaOrmEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'caption' })
    caption?: string;

    @Column({ type: 'smallint', enum: TripAreaType, name: 'type' })
    type: TripAreaType;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Geometry',
        srid: 4326, // SRID for WGS 84 (GPS coordinates)
        name: 'geo_content',
        // precision: 10000,
    })
    geoContent: Geometry;

    @Column({ type: 'int', name: 'trip_id' })
    @Index()
    tripId: number;

    @ManyToOne(() => TripOrmEntity, (trip) => trip.areas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trip_id', referencedColumnName: 'id' })
    trip: TripOrmEntity;
}