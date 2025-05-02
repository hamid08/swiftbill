import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TrackerLatestDataOrmEntity } from '../entities';
import { MinimalLocationB1, TrackerLatestData, TrackerLatestDataRepository } from 'src/tracking/domain';
import { GeoUtils } from 'src/common';

@Injectable()
export class PgTrackerLatestDataRepo
    extends Repository<TrackerLatestDataOrmEntity>
    implements TrackerLatestDataRepository {
    constructor(private dataSource: DataSource) {
        super(TrackerLatestDataOrmEntity, dataSource.createEntityManager());
    }

    async getPointDetails(trackerAssignmentId: number, latitude: number, longitude: number): Promise<MinimalLocationB1 | null> {
        // Define tolerance in meters (≈11 cm at equator)
        const toleranceMeters = 0.11;

        const latestData = await this.createQueryBuilder('data')
            .where('data.trackerAssignmentId = :trackerAssignmentId', { trackerAssignmentId })
            .andWhere(`ST_DWithin(
                data.location::geography,
                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                :tolerance
            )`, { longitude, latitude, tolerance: toleranceMeters })
            .orderBy('data.lastConnectedAt', 'DESC')
            .getOne();

        return latestData ? this.mapToPointDetailsDto(latestData) : null;
    }

    private mapToPointDetailsDto(latestDate: TrackerLatestDataOrmEntity): MinimalLocationB1 {

        const { latitude, longitude } = GeoUtils.pointToLatLng(latestDate.location);

        return {
            altitude: latestDate.altitude,
            angle: latestDate.angle,
            speed: latestDate.speed,
            lat: latitude,
            lng: longitude,
            date: latestDate.lastTrackedAt
        };
    }

    /**
     * Updates or creates a tracker's latest data.
     * If a record exists for the tracker assignment, it will be updated.
     * If no record exists, a new one will be created.
     * @param trackerLatestData - The tracker latest data domain entity to update/create.
     */
    async updateTrackerLatestData(trackerLatestData: TrackerLatestData): Promise<void> {
        try {
            const existingOrm = await this.findExistingRecord(trackerLatestData.getTrackerAssignmentId(), trackerLatestData.getExtensionId());

            if (existingOrm) {
                await this.updateExistingRecord(existingOrm, trackerLatestData);
            } else {
                await this.createNewRecord(trackerLatestData);
            }
        } catch (error) {
            throw new Error(`Failed to update tracker latest data: ${error.message}`);
        }
    }

    /**
     * Updates or creates a tracker's latest data using the terminal number.
     * @param terminalNumber - The terminal number of the tracker assignment.
     * @param trackerLatestData - The tracker latest data domain entity to update/create.
     */
    async updateTrackerLatestDataWithTerminalNumber(terminalNumber: string, trackerLatestData: TrackerLatestData): Promise<void> {
        try {
            const existingOrm = await this.findOne({
                where: {
                    trackerAssignment: { terminalNumber },
                },
            });

            if (existingOrm) {
                trackerLatestData.setTrackerAssignmentId(existingOrm.trackerAssignmentId);
                await this.updateTrackerLatestData(trackerLatestData);
            } else {
                throw new Error(`Tracker assignment with terminal number ${terminalNumber} not found.`);
            }
        } catch (error) {
            throw new Error(`Failed to update tracker latest data with terminal number: ${error.message}`);
        }
    }

    /**
     * Finds an existing record for the given tracker assignment and extension IDs.
     * @param trackerAssignmentId - The tracker assignment ID.
     * @param extensionId - The extension ID (optional).
     * @returns The existing ORM entity, if found.
     */
    private async findExistingRecord(trackerAssignmentId: number, extensionId?: number): Promise<TrackerLatestDataOrmEntity | null> {
        const whereClause = extensionId
            ? { trackerAssignmentId, extensionId }
            : { trackerAssignmentId };

        return await this.findOne({ where: whereClause });
    }

    /**
     * Updates an existing ORM entity with the latest data.
     * @param existingOrm - The existing ORM entity.
     * @param trackerLatestData - The latest data to update.
     */
    private async updateExistingRecord(existingOrm: TrackerLatestDataOrmEntity, trackerLatestData: TrackerLatestData): Promise<void> {
        const updateData = this.prepareUpdateData(existingOrm, trackerLatestData);
        await this.update(existingOrm.id, updateData);
    }

    /**
     * Prepares the data to update an existing ORM entity.
     * @param existingOrm - The existing ORM entity.
     * @param trackerLatestData - The latest data to update.
     * @returns The data to update.
     */
    private prepareUpdateData(existingOrm: TrackerLatestDataOrmEntity, trackerLatestData: TrackerLatestData): Partial<TrackerLatestDataOrmEntity> {
        const updateData: Partial<TrackerLatestDataOrmEntity> = {
            lastConnectedAt: trackerLatestData.getLastConnectedAt(),
        };

        if (existingOrm.lastTrackedAt < trackerLatestData.getLastTrackedAt()) {
            updateData.lastTrackedAt = trackerLatestData.getLastTrackedAt();
            updateData.location = trackerLatestData.getLocation();
            updateData.angle = trackerLatestData.getAngle();
            updateData.altitude = trackerLatestData.getAltitude();
            updateData.speed = trackerLatestData.getSpeed();
        }

        return updateData;
    }

    /**
     * Creates a new ORM entity with the latest data.
     * @param trackerLatestData - The latest data to create.
     */
    private async createNewRecord(trackerLatestData: TrackerLatestData): Promise<void> {
        const newOrm = this.mapToOrm(trackerLatestData);
        await this.save(newOrm);
    }

    /**
     * Maps a domain entity to an ORM entity.
     * @param trackerLatestData - The domain entity to map.
     * @returns The corresponding ORM entity.
     */
    private mapToOrm(trackerLatestData: TrackerLatestData): TrackerLatestDataOrmEntity {
        const trackerLatestDataOrm = new TrackerLatestDataOrmEntity();

        if (trackerLatestData.getId()) {
            trackerLatestDataOrm.id = trackerLatestData.getId();
        }

        trackerLatestDataOrm.lastTrackedAt = trackerLatestData.getLastTrackedAt() || new Date();
        trackerLatestDataOrm.lastConnectedAt = trackerLatestData.getLastConnectedAt() || new Date();
        trackerLatestDataOrm.location = trackerLatestData.getLocation();
        trackerLatestDataOrm.angle = trackerLatestData.getAngle();
        trackerLatestDataOrm.altitude = trackerLatestData.getAltitude();
        trackerLatestDataOrm.speed = trackerLatestData.getSpeed();
        trackerLatestDataOrm.trackerAssignmentId = trackerLatestData.getTrackerAssignmentId();
        trackerLatestDataOrm.extensionId = trackerLatestData.getExtensionId();

        return trackerLatestDataOrm;
    }

    /**
     * Maps an ORM entity to a domain entity.
     * @param trackerLatestDataOrm - The ORM entity to map.
     * @returns The corresponding domain entity.
     */
    private mapToDomain(trackerLatestDataOrm: TrackerLatestDataOrmEntity): TrackerLatestData {
        return TrackerLatestData.mapToDomain({
            id: trackerLatestDataOrm.id,
            lastTrackedAt: trackerLatestDataOrm.lastTrackedAt,
            lastConnectedAt: trackerLatestDataOrm.lastConnectedAt,
            location: trackerLatestDataOrm.location,
            angle: trackerLatestDataOrm.angle,
            altitude: trackerLatestDataOrm.altitude,
            speed: trackerLatestDataOrm.speed,
            trackerAssignmentId: trackerLatestDataOrm.trackerAssignmentId,
            extensionId: trackerLatestDataOrm.extensionId,
        });
    }
}