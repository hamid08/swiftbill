import { DataSource } from 'typeorm';
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

async function createAdminConnection(config: PostgresConfig): Promise<DataSource> {
  const adminConnection = new DataSource({
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: 'postgres' // Connect to default admin DB
  });

  try {
    await adminConnection.initialize();
    return adminConnection;
  } catch (error) {
    throw new Error(`Failed to establish admin connection: ${error.message}`);
  }
}

async function databaseExists(queryRunner: any, databaseName: string): Promise<boolean> {
  try {
    const result = await queryRunner.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName]
    );
    return result.length > 0;
  } catch (error) {
    throw new Error(`Failed to check database existence: ${error.message}`);
  }
}

async function createDatabase() {
  const connectionString = process.env.POSTGRESQL_URL;
  if (!connectionString) {
    throw new Error('POSTGRESQL_URL environment variable is not set');
  }

  const config = await parsePostgresConnectionString(connectionString);
  const adminConnection = await createAdminConnection(config);
  const queryRunner = adminConnection.createQueryRunner();

  try {
    const exists = await databaseExists(queryRunner, config.database);

    if (exists) {
      console.log(`Database already exists: ${config.database}`);
    } else {
      console.log(`Creating database: ${config.database}`);
      await queryRunner.query(`CREATE DATABASE "${config.database}"`);
      console.log(`Database created successfully: ${config.database}`);
    }
  } catch (error) {
    console.error('Database operation failed:', error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await adminConnection.destroy();
  }
}



createDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Database creation failed:', error);
    process.exit(1);
  });