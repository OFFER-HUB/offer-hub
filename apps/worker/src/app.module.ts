import { Module, OnApplicationShutdown, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './queues/queue.module';
import { HealthModule } from './health/health.module';
import { getRedisConfig } from './config/redis.config';

/**
 * Main application module for the OFFER-HUB Worker.
 *
 * Configures BullMQ with Redis connection and registers all job processors.
 */
@Module({
    imports: [
        // BullMQ configuration with Redis
        BullModule.forRoot({
            connection: getRedisConfig(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: {
                    age: 24 * 3600, // Keep completed jobs for 24 hours
                    count: 1000,    // Keep last 1000 completed jobs
                },
                removeOnFail: false, // Keep failed jobs for inspection
            },
        }),
        QueueModule,
        HealthModule,
    ],
})
export class AppModule implements OnApplicationShutdown {
    private readonly logger = new Logger(AppModule.name);

    /**
     * Graceful shutdown handler.
     * Called when the application receives SIGTERM or SIGINT.
     */
    onApplicationShutdown(signal?: string) {
        this.logger.log(`Received shutdown signal: ${signal}`);
        this.logger.log('Gracefully shutting down worker...');
        // BullMQ workers are automatically closed by NestJS shutdown hooks
    }
}
