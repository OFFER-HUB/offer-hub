import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [DatabaseModule, RedisModule],
    controllers: [HealthController],
    providers: [HealthService],
    exports: [HealthService],
})
export class HealthModule {}
