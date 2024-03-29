import { ClassSerializerInterceptor, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

import * as path from 'path';
import * as fs from 'fs';

import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ENV_CONSTANTS, QUEUE_PREFIX, STRING_CONSTANTS } from './config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionsFilter } from './filters/global.exception.filter';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/user-role.guard';
import { BullModule } from '@nestjs/bull';
import { CoreModule } from './modules/core/core.module';
import { DeviceModule } from './modules/device/device.module';
import { ReportModule } from './modules/report/report.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        if (configService.get<string>(ENV_CONSTANTS.ENV) === 'dev') {
          return {
            uri: configService.get<string>(ENV_CONSTANTS.DB_URI),
            dbName: configService.get<string>(ENV_CONSTANTS.DB_NAME),
          };
        } else {
          const tlsCAFile = path.resolve(
            __dirname,
            '../rds-combined-ca-bundle.pem',
          );
          return {
            uri: configService.get<string>(ENV_CONSTANTS.DB_URI),
            tlsCAFile,
            ssl: true,
            sslValidate: false,
          };
        }
      },
      inject: [ConfigService],
      connectionName: STRING_CONSTANTS.MAIN_DOC_DB_CONNECTION_NAME,
    }),
    EventEmitterModule.forRoot({
      maxListeners: 100,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>(ENV_CONSTANTS.REDIS_HOST),
          port: config.get<number>(ENV_CONSTANTS.REDIS_PORT),
          password: config.get<string>(ENV_CONSTANTS.REDIS_PASS),
        },
        prefix: QUEUE_PREFIX,
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            host: config.get<string>(ENV_CONSTANTS.SMTP_HOST),
            port: config.get<number>(ENV_CONSTANTS.SMTP_PORT),
            pool: true,
            secure: false,
            auth: {
              user: config.get<string>(ENV_CONSTANTS.SMTP_USER),
              pass: config.get<string>(ENV_CONSTANTS.SMTP_PASS),
            },
          },
          defaults: {
            from: config.get<string>(ENV_CONSTANTS.EMAIL_FROM),
          },
          template: {
            dir: path.join(__dirname, '..', 'views', 'emails'),
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
    }),
    CoreModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    DeviceModule,
    ReportModule,
    SiteConfigModule,
  ],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
