import './register-otel';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './utils/structured-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(6000);
  logger.info('API Gateway running on http://localhost:6000');
}

bootstrap();
