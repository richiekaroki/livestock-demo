import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { requestIdMiddleware } from './common/request-id.middleware';
import { structuredLogger } from './common/structured-logger.middleware';

function validateSecrets() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'dev-secret-change-me') {
    throw new Error(
      'FATAL: JWT_SECRET is missing or set to the default value. ' +
        'Set a strong random string in your .env file. ' +
        'Example: JWT_SECRET=$(openssl rand -hex 32)',
    );
  }
}

async function bootstrap() {
  validateSecrets();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    frameguard: { action: 'deny' },
  }));
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.use(structuredLogger);

  const corsOrigins = process.env.CORS_ORIGIN?.split(',').filter(Boolean);
  if (!corsOrigins || corsOrigins.length === 0) {
    throw new Error(
      'FATAL: CORS_ORIGIN must be set to a comma-separated list of allowed origins. ' +
        'Example: CORS_ORIGIN=https://yourdomain.com',
    );
  }
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Wam Mfugo API')
    .setDescription(
      'Offline-first livestock tracking platform for Kenya. Passwordless email-OTP auth with role-based access.',
    )
    .setVersion('0.2.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
void bootstrap();
