import { Module } from '@nestjs/common';
import { RedisService } from '@app/database/redis/redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService], // Export RedisService for use in other modules
})
export class RedisModule {}
