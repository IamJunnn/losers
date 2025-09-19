import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend - Very permissive for testing
  app.enableCors({
    origin: true, // Allow all origins for now
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Option 2: No global prefix - all routes available at root level
  // Routes will be: /, /auth/*, /posts/* instead of /api/*, /api/auth/*, /api/posts/*
  // Comment out the line below to use Option 1 with /api prefix:
  // app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
