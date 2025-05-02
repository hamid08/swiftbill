import { Module, Global, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheService } from 'src/tracking';

const logger = new Logger('RedisModule');


@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: CacheService,
      useClass: RedisService,
    },
  ],
  exports: [CacheService],
})
export class RedisModule { }
