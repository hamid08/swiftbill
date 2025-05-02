import { DataSource } from 'typeorm';
import { ApplicationSettingOrmEntity, BusinessOrmEntity, IoParameterOrmEntity, IoParameterValueOrmEntity, ScenarioSettingOrmEntity, TrackerAssignmentOrmEntity, TrackerDataParameterOrmEntity, TrackerLatestDataOrmEntity, TrackerOrmEntity, TrackingBrandOrmEntity, TrackingDeviceOrmEntity, TrackingEventOrmEntity, TrackingExtensionOrmEntity, TrackingModelOrmEntity, UserOrmEntity, UserVehicleAccessOrmEntity, VehicleOrmEntity, ViolationLocationOrmEntity, ViolationOrmEntity } from '../entities';
import { TripOrmEntity } from '../entities/trip.orm-entity';
import { TripAreaOrmEntity } from '../entities/trip-area.orm-entity';
import * as dotenv from 'dotenv';
import { PostgresConfig } from './postgresql.config';

// Load environment variables
dotenv.config();

function parsePostgresConnectionString(connectionString: string): PostgresConfig {
  // Remove surrounding quotes if present
  const cleanUri = connectionString.replace(/"/g, '');

  // Key-value format (e.g., "Host=...;Database=...")
  if (cleanUri.includes("Host=") && cleanUri.includes("Database=")) {
    const config: Record<string, string> = {};
    cleanUri.split(';').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) config[key.trim()] = value.trim();
    });

    if (!config.Host || !config.Database || !config.Username || !config.Password) {
      throw new Error(`Invalid PostgreSQL key-value format: ${cleanUri}`);
    }

    const [host, portStr] = config.Host.split(':');
    const port = portStr ? parseInt(portStr, 10) : 5432;

    return {
      host,
      port,
      username: config.Username,
      password: config.Password,
      database: config.Database,
      uri: `postgres://${config.Username}:${config.Password}@${host}:${port}/${config.Database}`,
    };
  }
  // URI format (e.g., "postgres://user:pass@host:port/db")
  else {
    const pattern = /^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const matches = cleanUri.match(pattern);

    if (!matches) {
      throw new Error(`Invalid PostgreSQL URI format: ${cleanUri}`);
    }

    return {
      host: matches[3],
      port: parseInt(matches[4], 10),
      username: matches[1],
      password: matches[2],
      database: matches[5],
      uri: cleanUri,
    };
  }
}

function createDataSource(config: PostgresConfig): DataSource {
  return new DataSource({
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    // Register all entities here
    // IMPORTANT: Ensure that entities are registered before defining relations between them.
    // If an entity is not registered, TypeORM will not be able to resolve its metadata,
    // leading to errors like "Entity metadata for <EntityName> was not found."
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
    migrations: ['dist/src/tracking/infrastructure/database/postgresql/migrations/*.js'],
    logging: true,
    migrationsRun: true,
  });
}

// Main execution
const postgresUrl = process.env.POSTGRESQL_URL;
if (!postgresUrl) {
  throw new Error('POSTGRESQL_URL environment variable is not set');
}

const postgresConfig = parsePostgresConnectionString(postgresUrl);
const dataSource = createDataSource(postgresConfig);

export default dataSource;