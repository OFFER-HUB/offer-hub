import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    IdempotencyModule,
    HealthModule,
    AuthModule
  ],
})
export class AppModule { }
