import 'reflect-metadata';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

config();

const logger = new Logger('WorkerBootstrap');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable graceful shutdown
    app.enableShutdownHooks();

    const port = process.env.WORKER_PORT || 3001;
    await app.listen(port);

    logger.log(`🚀 Worker running on port ${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
    logger.error('Failed to start worker', error);
    process.exit(1);
});
