import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
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
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DatabaseModule,
    RedisModule,
    IdempotencyModule,
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
