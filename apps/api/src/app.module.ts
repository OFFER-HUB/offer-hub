import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { TrustlessWorkModule } from './providers/trustless-work/trustless-work.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    IdempotencyModule,
    TrustlessWorkModule,
    HealthModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
