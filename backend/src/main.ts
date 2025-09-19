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

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Add a simple health check for root route
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({ message: 'Backend is running', status: 'ok', timestamp: new Date().toISOString() });
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
