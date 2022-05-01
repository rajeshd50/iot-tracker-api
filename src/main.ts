import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as path from 'path';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ConfigService } from '@nestjs/config';
import { ENV_CONSTANTS } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.use(compression());
  app.use(helmet());
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      validationError: {
        value: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));

  app.setViewEngine('ejs');

  app.useGlobalInterceptors(new ErrorInterceptor());

  app.enableShutdownHooks();

  await app.listen(configService.get<number>(ENV_CONSTANTS.PORT) || 5000);
}
bootstrap();
