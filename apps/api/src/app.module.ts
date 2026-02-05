import { Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { ConfigModule } from './modules/config/config.module';
import { TrustlessWorkModule } from './providers/trustless-work/trustless-work.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { TopUpsModule } from './modules/topups/topups.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { BalanceModule } from './modules/balance/balance.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ResolutionModule } from './modules/resolution/resolution.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AuditModule } from './modules/audit-logs/audit.module';
import { AirtmModule } from './providers/airtm/airtm.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { QueueModule } from './modules/queues/queue.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

/**
 * Parse Redis URL into connection options for BullMQ.
 */
function getRedisConnection() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
        const url = new URL(redisUrl);
        return {
            host: url.hostname,
            port: parseInt(url.port || '6379', 10),
            password: url.password || undefined,
            maxRetriesPerRequest: null, // Required for BullMQ
        };
    } catch {
        return {
            host: 'localhost',
            port: 6379,
            maxRetriesPerRequest: null,
        };
    }
}

@Module({
  imports: [
    // BullMQ for background job processing
    BullModule.forRoot({
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: { age: 24 * 3600, count: 1000 },
        removeOnFail: false,
      },
    }),
    EventsModule,
    DatabaseModule,
    RedisModule,
    IdempotencyModule,
    ConfigModule,
    TrustlessWorkModule,
    HealthModule,
    AuthModule,
    AirtmModule,
    WebhooksModule,
    UsersModule,
    TopUpsModule,
    WithdrawalsModule,
    BalanceModule,
    OrdersModule,
    ResolutionModule,
    DisputesModule,
    AuditModule,
    QueueModule, // Background job queues and processors
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
