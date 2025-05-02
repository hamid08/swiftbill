import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationSettingOrmEntity, BusinessOrmEntity, IoParameterOrmEntity, IoParameterValueOrmEntity, ScenarioSettingOrmEntity, TrackerAssignmentOrmEntity, TrackerDataParameterOrmEntity, TrackerLatestDataOrmEntity, TrackerOrmEntity, TrackingBrandOrmEntity, TrackingDeviceOrmEntity, TrackingEventOrmEntity, TrackingExtensionOrmEntity, TrackingModelOrmEntity, UserOrmEntity, UserVehicleAccessOrmEntity, VehicleOrmEntity, ViolationLocationOrmEntity, ViolationOrmEntity } from './entities';
import { AppConfigModule, AppConfigService } from 'src/config';
import { TripAreaOrmEntity } from './entities/trip-area.orm-entity';
import { TripOrmEntity } from './entities/trip.orm-entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [AppConfigModule],
            inject: [AppConfigService],
            useFactory: (configService: AppConfigService) => {

                const pgConfig = configService.infrastructure.postgreSql;

                return {
                    type: 'postgres',
                    host: pgConfig.host,
                    database: pgConfig.database,
                    port: pgConfig.port,
                    username: pgConfig.username,
                    password: pgConfig.password,
                    migrationsRun: true,
                    entities: [
                        BusinessOrmEntity,
                        VehicleOrmEntity,
                        TrackingBrandOrmEntity,
                        TrackingModelOrmEntity,
                        IoParameterOrmEntity,
                        IoParameterValueOrmEntity,
                        TrackingExtensionOrmEntity,
                        TrackingEventOrmEntity,
                        TrackingDeviceOrmEntity,
                        TrackerOrmEntity,
                        UserOrmEntity,
                        UserVehicleAccessOrmEntity,
                        ApplicationSettingOrmEntity,
                        TrackerAssignmentOrmEntity,
                        TrackerLatestDataOrmEntity,
                        TrackerDataParameterOrmEntity,
                        ViolationOrmEntity,
                        ViolationLocationOrmEntity,
                        TripOrmEntity,
                        TripAreaOrmEntity,
                        ScenarioSettingOrmEntity
                    ],
                    retryDelay: 3000, // Retry connection every 3 seconds
                    retryAttempts: Infinity, // Retry connection indefinitely
                }
            },
        }),
        TypeOrmModule.forFeature([
            BusinessOrmEntity,
            VehicleOrmEntity,
            TrackingBrandOrmEntity,
            TrackingModelOrmEntity,
            IoParameterOrmEntity,
            IoParameterValueOrmEntity,
            TrackingExtensionOrmEntity,
            TrackingEventOrmEntity,
            TrackingDeviceOrmEntity,
            TrackerOrmEntity,
            UserOrmEntity,
            UserVehicleAccessOrmEntity,
            ApplicationSettingOrmEntity,
            TrackerAssignmentOrmEntity,
            TrackerLatestDataOrmEntity,
            TrackerDataParameterOrmEntity,
            ViolationOrmEntity,
            ViolationLocationOrmEntity,
            TripOrmEntity,
            TripAreaOrmEntity,
            ScenarioSettingOrmEntity
        ]),
    ],
    exports: [
        TypeOrmModule.forFeature([
            ApplicationSettingOrmEntity,
            BusinessOrmEntity
        ]),
    ],
})
export class TrackingPostgreSqlModule { }