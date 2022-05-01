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

const rds = fs.readFileSync(
  path.resolve(__dirname, '../rds-combined-ca-bundle.pem'),
);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(ENV_CONSTANTS.DB_URI),
        // dbName: configService.get<string>(ENV_CONSTANTS.DB_NAME),
        tlsCAFile: rds,
        ssl: true,
        sslValidate: false,
      }),
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
    // MailerModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     return {
    //       transport: config.get<string>(ENV_CONSTANTS.SMTP_URL),
    //       defaults: {
    //         from: config.get<string>(ENV_CONSTANTS.EMAIL_FROM),
    //       },
    //       template: {
    //         dir: path.join(__dirname, '..', 'views'),
    //         adapter: new EjsAdapter(),
    //         options: {
    //           strict: true,
    //         },
    //       },
    //     };
    //   },
    // }),
    CoreModule,
    DatabaseModule,
    AuthModule,
    UserModule,
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
