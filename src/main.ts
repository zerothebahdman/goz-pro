import { Logger, defaultSerializers } from '@blinkclaud/octobus';
import { NextFunction, Request, Response } from 'express';
import { captureBody, logRequest } from './middlewares/request.logging';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import env from './config/env';
import { v4 } from 'uuid';

async function bootstrap() {
  const logger = new Logger({ name: env().service_name, serializers: defaultSerializers() });

  const app = await NestFactory.create(AppModule);
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // If x-request-id is not present, generate one (useful for distributed tracing)
    req.headers['x-request-id'] = req.headers['x-request-id'] ?? v4();
    next();
  });

  app.enableVersioning({ type: VersioningType.URI, prefix: 'api/v' });
  app.use(logRequest(logger));
  app.use(captureBody);
  const config = app.get(ConfigService);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    // If x-request-id is not present, generate one (useful for distributed tracing)
    req.headers['x-request-id'] = req.headers['x-request-id'] ?? v4();
    next();
  });

  await app.listen(config.get<number>('port') || 3210, '0.0.0.0', () => {
    logger.log(`Server 🚀 is running on on port ${config.get<number>('port') || 3210}`);
  });
}
bootstrap();
