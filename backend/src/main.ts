import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);
  Logger.log(`Backend listening on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
