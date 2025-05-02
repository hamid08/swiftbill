import { Module, Logger } from '@nestjs/common';
import {
  ModelDefinition,
  MongooseModule,
  MongooseModuleFactoryOptions,
} from '@nestjs/mongoose';
import { Connection, MongooseError } from 'mongoose';
import { AppConfigService } from 'src/config';

@Module({
  imports: [
    // Async configuration for MongoDB connection
    MongooseModule.forRootAsync({
      useFactory: (
        appConfigService: AppConfigService,
      ): MongooseModuleFactoryOptions => ({
        uri: appConfigService.infrastructure.mongo.uri,
        autoIndex: true,
        maxPoolSize: 100000,
        wtimeoutMS: 2500,
        connectTimeoutMS: 360000,
        socketTimeoutMS: 360000,
        retryAttempts: Infinity, // Number of retry attempts
        retryDelay: 3000, // Delay between retries in milliseconds
        connectionFactory: (connection: Connection, connectionName: string) => {
          connection.on('connected', () => {
            Logger.log('MongoDB connected successfully', 'DatabaseModule');
          });
          connection.on('error', (error: MongooseError) => {
            Logger.error(
              'MongoDB connection error',
              error.message,
              'DatabaseModule',
            );
          });
          connection.on('disconnected', () => {
            Logger.error('MongoDB disconnected', 'DatabaseModule');
          });
          connection.on('reconnected', () => { });
          return connection;
        },
        connectionErrorFactory: (error: MongooseError) => {
          Logger.error(
            'Custom MongoDB connection error handler',
            error.message,
            'DatabaseModule',
          );
          return error; // Optionally customize the error further
        },
        verboseRetryLog: true, // Enable verbose logging for retry attempts
      }),
      inject: [AppConfigService],
    }),
  ],
})
export class MongoModule {
  static forFeature(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
