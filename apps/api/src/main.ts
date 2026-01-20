import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { resolve } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// Load .env from monorepo root (works with tsx watch from apps/api/)
config({ path: resolve(process.cwd(), '../../.env') });

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const banner = `
 ██████╗ ███████╗███████╗███████╗██████╗       ██╗  ██╗██╗   ██╗██████╗
██╔═══██╗██╔════╝██╔════╝██╔════╝██╔══██╗      ██║  ██║██║   ██║██╔══██╗
██║   ██║█████╗  █████╗  █████╗  ██████╔╝█████╗███████║██║   ██║██████╔╝
██║   ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗╚════╝██╔══██║██║   ██║██╔══██╗
╚██████╔╝██║     ██║     ███████╗██║  ██║      ██║  ██║╚██████╔╝██████╔╝
 ╚═════╝ ╚═╝     ╚═╝     ╚══════╝╚═╝  ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝

---------------------- Marketplaces Orchestrator ----------------------
`;
  console.log(banner);

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter for standardized error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor for standardized success responses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Enable shutdown hooks for clean closing (database connections, etc.)
  app.enableShutdownHooks();

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;

  await app.listen(port);
  logger.log(`API listening on port ${port}`);

  // Handle clean exit for signals
  process.on('SIGINT', async () => {
    logger.log('Application is shutting down (SIGINT)...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.log('Application is shutting down (SIGTERM)...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
