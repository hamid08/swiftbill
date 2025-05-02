import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CACHE_CONSTANTS } from 'src/common';
import { AppConfigService } from 'src/config';
import { CacheService } from 'src/tracking';

@Injectable()
export class RedisService implements CacheService, OnModuleInit {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private readonly defaultField: string = CACHE_CONSTANTS.DEFAULT_FIELD;

  constructor(private appConfigService: AppConfigService) { }

  onModuleInit() {
    this.initializeRedisClient();
  }

  private initializeRedisClient(): void {
    const redisUrl = this.appConfigService.infrastructure.redis.uri;
    const url = new URL(redisUrl);
    const host = url.hostname;
    const port = parseInt(url.port, 10) || 6379;
    const password = url.password || undefined;

    this.client = new Redis({
      host,
      port,
      password,
      retryStrategy: this.retryStrategy.bind(this),
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
    });

    this.client.on('connect', () => this.logger.log('✓ Redis client connected'));
    this.client.on('reconnecting', () => this.logger.warn('⌛️ Redis client reconnecting...'));
    this.client.on('error', (error) => this.logger.error('⭕ Redis client error: ', error));
    this.client.on('close', () => this.logger.warn('⭕ Redis client connection closed'));
  }

  private retryStrategy(times: number): number | null {
    const delay = Math.min(times * 100, 3000);
    this.logger.log(`Redis reconnecting in ${delay}ms...`);
    return delay;
  }

  private parseJson<T>(value: string): T | string {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private stringifyValue(value: any): string {
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  async setKey<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = this.stringifyValue(value);
      await this.client.set(key, stringValue);
    } catch (error) {
      this.logger.error(`Failed to set key ${key}: ${error.message}`);
    }
  }

  async deleteKey(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}: ${error.message}`);
    }
  }

  async getKey<T>(key: string): Promise<T | null> {
    try {
      const result = await this.client.get(key);
      return result ? (this.parseJson(result) as T) : null;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}: ${error.message}`);
      return null;
    }
  }

  async hSet<T>(key: string, value: T): Promise<number | null> {
    try {
      const stringValue = this.stringifyValue(value);
      return await this.client.hset(key, this.defaultField, stringValue);
    } catch (error) {
      this.logger.error(`Failed to hSet key ${key}: ${error.message}`);
      return null;
    }
  }

  async hGet<T = any>(key: string): Promise<T | null> {
    try {
      const result = await this.client.hget(key, this.defaultField);
      return result ? (this.parseJson(result) as T) : null;
    } catch (error) {
      this.logger.error(`Failed to hGet key ${key}: ${error.message}`);
      return null;
    }
  }


  async hGetAll<T>(key: string): Promise<T | null> {
    try {
      const result = await this.client.hgetall(key);
      if (!result || Object.keys(result).length === 0) return null;

      const parsedResult: Record<string, any> = Object.fromEntries(
        Object.entries(result).map(([field, value]) => [
          field,
          this.parseJson(value),
        ])
      );

      return (parsedResult.data ?? parsedResult) as T;
    } catch (error) {
      this.logger.error(`Failed to hGetAll for key ${key}: ${error.message}`);
      return null;
    }
  }

  async hDel(key: string): Promise<number | null> {
    try {
      return await this.client.hdel(key, this.defaultField);
    } catch (error) {
      this.logger.error(`Failed to hDel key ${key}: ${error.message}`);
      return null;
    }
  }
}
