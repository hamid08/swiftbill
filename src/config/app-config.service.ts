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
      const rabbitMqUri = this.configService.get<string>('RABBITMQ_URL', 'amqp://hamid:hamid@192.168.3.34:5672');

      if (!mongoUri || !rabbitMqUri) {
        throw new Error('Infrastructure configuration is incomplete!');
      }

      return {
        mongo: { uri: mongoUri },
        rabbitMq: this.parseRabbitMqUri(rabbitMqUri),
      };
    } catch (error) {
      this.logger.error(`Failed to load infrastructure configuration: ${error.message}`);
      throw new Error('Infrastructure configuration is invalid or missing!');
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
}