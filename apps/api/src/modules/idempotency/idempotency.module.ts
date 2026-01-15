import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { IdempotencyService } from './idempotency.service';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { IdempotencyGuard } from '../../common/guards/idempotency.guard';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';
import { IdempotencyFilter } from '../../common/filters/idempotency.filter';

@Global()
@Module({
    imports: [DatabaseModule, RedisModule],
    providers: [
        IdempotencyService,
        {
            provide: APP_GUARD,
            useClass: IdempotencyGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: IdempotencyInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: IdempotencyFilter,
        },
    ],
    exports: [IdempotencyService],
})
export class IdempotencyModule { }
