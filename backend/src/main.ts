import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

dotenv.config();

// Custom IoAdapter with CORS configuration
class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
      },
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all routes - with wildcard origin to ensure it works with file:// protocol
  app.enableCors({
    origin: '*', // Using wildcard to ensure it works with 'null' origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // Use custom Socket.io adapter with CORS configuration
  app.useWebSocketAdapter(new CustomIoAdapter(app));
  
  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log('\n=======================================');
  console.log('🚀 OFFER-HUB Server is running!');
  console.log('=======================================');
  console.log(`🌍 URL: http://localhost:${port}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log('=======================================\n');
}

bootstrap();
