import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENV_CONSTANTS, STRING_CONSTANTS } from './constants';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(ENV_CONSTANTS.DOC_DB_URI),
        dbName: configService.get<string>(ENV_CONSTANTS.DOC_DB_NAME),
      }),
      inject: [ConfigService],
      connectionName: STRING_CONSTANTS.MAIN_DOC_DB_CONNECTION_NAME,
    }),
    CacheModule.register(),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
