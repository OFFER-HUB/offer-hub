import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

config();

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
