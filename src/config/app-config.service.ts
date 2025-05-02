import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);

  constructor(private readonly configService: ConfigService) { }

  // ===========================
  // 🌐 Application Configuration
  // ===========================

  get application() {
    try {
      const port = +this.configService.get<number>('PORT', 2324); // Ensure number type
      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

      if (!port || !nodeEnv) {
        throw new Error('Application configuration is incomplete!');
      }

      return { port, nodeEnv };
    } catch (error) {
      this.logger.error(`Failed to load application configuration: ${error.message}`);
      throw new Error('Application configuration is invalid or missing!');
    }
  }

  // ===========================
  // 🛠️ Infrastructure Services
  // ===========================

  private parsePostgreSqlUri(uri: string): {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    uri: string;
  } {
    // Remove surrounding quotes if present (e.g., `"Host=..."` → `Host=...`)
    const cleanUri = uri.replace(/"/g, '');

    // Check if it's a key-value format (e.g., "Host=...;Database=...")
    if (cleanUri.includes("Host=") && cleanUri.includes("Database=")) {
      const config: Record<string, string> = {};
      cleanUri.split(';').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) config[key.trim()] = value.trim();
      });

      if (!config.Host || !config.Database || !config.Username || !config.Password) {
        throw new Error(`Invalid PostgreSQL key-value format: ${cleanUri}`);
      }

      // Extract port from Host (if present, e.g., "192.168.3.23:5332")
      const [host, portStr] = config.Host.split(':');
      const port = portStr ? parseInt(portStr, 10) : 5432; // Default PostgreSQL port

      return {
        host,
        port,
        username: config.Username,
        password: config.Password,
        database: config.Database,
        uri: `postgres://${config.Username}:${config.Password}@${host}:${port}/${config.Database}`,
      };
    }
    // Otherwise, treat as URL format (e.g., "postgres://user:pass@host:port/db")
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

  private parseRabbitMqUri(uri: string): {
    host: string;
    port: number;
    username: string;
    password: string;
    vhost: string;
    uri: string; // AMQP URI format
  } {
    // Remove surrounding quotes if present
    const cleanUri = uri.replace(/"/g, '');

    // Check if it's a key-value format (e.g., "Host=...;Username=...")
    if (cleanUri.includes("Host=") && cleanUri.includes("Username=")) {
      const config: Record<string, string> = {};
      cleanUri.split(';').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) config[key.trim()] = value.trim();
      });

      if (!config.Host || !config.Username || !config.Password) {
        throw new Error(`Invalid RabbitMQ key-value format: ${cleanUri}`);
      }

      // Extract port from Host (e.g., "192.168.3.34:5672" → host="192.168.3.34", port=5672)
      const [host, portStr] = config.Host.split(':');
      const port = portStr ? parseInt(portStr, 10) : 5672; // Default RabbitMQ port

      // Default virtual host ("/") if not specified
      const vhost = config.VirtualHost || config.vhost || '/';

      return {
        host,
        port,
        username: config.Username,
        password: config.Password,
        vhost,
        uri: `amqp://${config.Username}:${config.Password}@${host}:${port}/${vhost.replace(/^\//, '')}`, // AMQP URI format
      };
    }
    // Otherwise, treat as URI format (e.g., "amqp://user:pass@host:port/vhost")
    else {
      const pattern = /^amqp:\/\/([^:]+):([^@]+)@([^:]+):(\d+)(?:\/([^/]+))?$/;
      const matches = cleanUri.match(pattern);

      if (!matches) {
        throw new Error(`Invalid RabbitMQ URI format: ${cleanUri}`);
      }

      return {
        host: matches[3],
        port: parseInt(matches[4], 10),
        username: matches[1],
        password: matches[2],
        vhost: matches[5] || '/', // Default to "/"
        uri: cleanUri,
      };
    }
  }

  get infrastructure() {
    try {
      const mongoUri = this.configService.get<string>('MONGO_URL', 'mongodb://192.168.3.34:27888/tracking-customer-nest');
      const redisUri = this.configService.get<string>('REDIS_URL', 'redis://@192.168.3.34:6379');
      const rabbitMqUri = this.configService.get<string>('RABBITMQ_URL', 'amqp://hamid:hamid@192.168.3.34:5672');
      const postgreSqlUri = this.configService.get<string>('POSTGRESQL_URL', 'postgres://root:fr24Password@192.168.3.23:5332/pga-orm3');

      if (!mongoUri || !redisUri || !rabbitMqUri || !postgreSqlUri) {
        throw new Error('Infrastructure configuration is incomplete!');
      }

      return {
        mongo: { uri: mongoUri },
        redis: { uri: redisUri },
        rabbitMq: this.parseRabbitMqUri(rabbitMqUri),
        postgreSql: this.parsePostgreSqlUri(postgreSqlUri),
      };
    } catch (error) {
      this.logger.error(`Failed to load infrastructure configuration: ${error.message}`);
      throw new Error('Infrastructure configuration is invalid or missing!');
    }
  }

  // ===========================
  // 🔐 Authentication & Security
  // ===========================

  get auth() {
    try {
      const secretKey = this.configService.get<string>('AUTH_SECRET_KEY', 'DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=');
      const audience = this.configService.get<string>('AUTH_AUDIENCE', 'tracking-micro');
      const authority = this.configService.get<string>('AUTH_AUTHORITY', 'https://192.168.3.62:7057/');
      const apiKey = this.configService.get<string>('API_KEY', 'ac48d83993c77c7c38c2a35ac0848ca9');

      if (!secretKey || !audience || !authority || !apiKey) {
        throw new Error('Authentication configuration is incomplete!');
      }

      return { secretKey, audience, authority, apiKey };
    } catch (error) {
      this.logger.error(`Failed to load authentication configuration: ${error.message}`);
      throw new Error('Authentication configuration is invalid or missing!');
    }
  }

  // ===========================
  // 🌍 CORS Configuration
  // ===========================

  get cors() {
    try {
      const allowedOrigins = this.configService.get<string>('ALLOWED_ORIGINS_API', 'http://localhost:8383');
      if (!allowedOrigins) {
        throw new Error('CORS configuration is incomplete!');
      }

      return {
        allowedOrigins: allowedOrigins.split(',').map(origin => origin.trim()) || [],
      };
    } catch (error) {
      this.logger.error(`Failed to load CORS configuration: ${error.message}`);
      throw new Error('CORS configuration is invalid or missing!');
    }
  }

  // ===========================
  // ⛅ Open Weather API Configuration
  // ===========================

  get openWeatherApi() {
    try {
      const url = this.configService.get<string>('OPEN_WEATHER_API_URL', 'https://api.openweathermap.org/data/2.5/weather');
      const token = this.configService.get<string>('OPEN_WEATHER_API_TOKEN', '8cd899303d0bf3383700e8a0e67e0e83');

      if (!url || !token) {
        throw new Error('Open Weather API configuration is incomplete!');
      }

      return { url, token };
    } catch (error) {
      this.logger.error(`Failed to load Open Weather API configuration: ${error.message}`);
      throw new Error('Open Weather API configuration is invalid or missing!');
    }
  }

  // ===========================
  // 🔄 API Synchronization Settings
  // ===========================

  get sync() {
    try {
      const mode = this.configService.get<number>('SYNC_MODE', 1);
      const singleEndpointUrl = this.configService.get<string>('SYNC_SINGLE_URL', 'https://localhost:59782');
      const singleEndpointAccessKey = this.configService.get<string>('SYNC_SINGLE_ACCESS_KEY', 'f926363b-2357-47a0-a03e-560927cfac4a');
      const fleetUrl = this.configService.get<string>('SYNC_FLEET_URL', 'https://localhost:58851');
      const coreUrl = this.configService.get<string>('SYNC_CORE_URL', 'https://localhost:56773');
      const clientId = this.configService.get<string>('SYNC_API_CLIENT_ID', 'separta_api');
      const clientSecret = this.configService.get<string>('SYNC_API_CLIENT_SECRET', 'fac58c1e-04be-4b62-8171-f4e69257564c');
      const clientScope = this.configService.get<string>('SYNC_API_CLIENT_SCOPE', 'resource_separta_api');

      if (
        !mode ||
        !singleEndpointUrl ||
        !singleEndpointAccessKey ||
        !fleetUrl ||
        !coreUrl ||
        !clientId ||
        !clientSecret ||
        !clientScope
      ) {
        throw new Error('API synchronization configuration is incomplete!');
      }

      const synchronizationMode: 'Single' | 'Multiple' = Number(mode) === 1 ? 'Single' : 'Multiple';

      return {
        mode: synchronizationMode,
        singleEndpoint: { url: singleEndpointUrl, accessKey: singleEndpointAccessKey },
        multipleEndpoints: { fleetUrl, coreUrl },
        clientCredentials: { clientId, clientSecret, clientScope },
      };
    } catch (error) {
      this.logger.error(`Failed to load synchronization configuration: ${error.message}`);
      throw new Error('Synchronization configuration is invalid or missing!');
    }
  }

  // ===========================
  // 📍 Tracking Agent Configuration
  // ===========================

  get trackingAgent() {
    try {
      const url = this.configService.get<string>('TRACKING_AGENT_URL', 'http://localhost:8686');
      if (!url) {
        throw new Error('TRACKING_AGENT_URL is required!');
      }

      const communicationGuardToken = this.configService.get<string>('TRACKING_AGENT_COMMUNICATION_GUARD_TOKEN', 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6');
      if (!communicationGuardToken) {
        throw new Error('TRACKING_AGENT_COMMUNICATION_GUARD_TOKEN is required!');
      }

      return { url, communicationGuardToken };
    } catch (error) {
      this.logger.error(`Failed to load tracking agent configuration: ${error.message}`);
      throw new Error('Tracking agent configuration is invalid or missing!');
    }
  }

  // ===========================
  // 🗺️ Neshan API Configuration
  // ===========================

  get neshanApi() {
    try {
      const url = this.configService.get<string>('NESHAN_API_URL', 'https://api.neshan.org/v5/reverse');
      const apiKey = this.configService.get<string>('NESHAN_API_KEY', 'service.59b59746045741118e784a21097bddbd');

      if (!url || !apiKey) {
        throw new Error('Neshan API configuration is incomplete!');
      }

      return { url, apiKey };
    } catch (error) {
      this.logger.error(`Failed to load Neshan API configuration: ${error.message}`);
      throw new Error('Neshan API configuration is invalid or missing!');
    }
  }

  // ===========================
  // 🤝 Partner Services Configuration
  // ===========================

  get partnerServices() {
    try {
      const enabled = this.toBoolean(
        this.configService.get<string>('TRACKING_PARTNER_ENABLED', 'false')
      );
      const authToken = this.configService.get<string>(
        'TRACKING_PARTNERS_AUTH_TOKEN',
        'sk_part_3aX2!9z$B8qY5%vF7pL6*wDcRnKtJmH'
      );
      const partnerIds = this.configService.get<string>('TRACKING_PARTNER_IDS', '')
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      // Validate required fields if enabled
      if (enabled && (!authToken || authToken.length < 32)) {
        throw new Error('Partner auth token must be at least 32 characters when partner services are enabled');
      }

      return {
        enabled,
        authToken,
        partnerIds
      };
    } catch (error) {
      this.logger.error(`Failed to load partner services configuration: ${error.message}`);
      throw new Error('Partner services configuration is invalid or missing!');
    }
  }


  // ===========================
  // ⚙️ External Gateway Configuration
  // ===========================

  get externalGateway() {
    try {
      const enabled = this.toBoolean(this.configService.get<string>('EG_ENABLED', 'false'));
      return { enabled };
    } catch (error) {
      this.logger.error(`Failed to load external gateway configuration: ${error.message}`);
      throw new Error('External gateway configuration is invalid or missing!');
    }
  }

  // Utility function to safely convert string to boolean
  private toBoolean(value: string): boolean {
    return value === 'true'; // Converts 'true' or 'false' strings to actual boolean
  }
}