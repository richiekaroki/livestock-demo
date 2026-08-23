import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { requestIdMiddleware } from './common/request-id.middleware';
import { structuredLogger } from './common/structured-logger.middleware';
import { createWinstonLogger } from './common/winston.config';
import { AllExceptionsFilter } from './common/exception-filter';

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

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: createWinstonLogger(),
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
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
  if (corsOrigins.includes('*') && process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: CORS_ORIGIN=* is not allowed in production. ' +
        'Set specific origins like CORS_ORIGIN=https://yourdomain.com',
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
    .setVersion('1.0.0')
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
