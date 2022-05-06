import { Global, Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';

import { DEFAULT_CACHE_TTL, ENV_CONSTANTS, STRING_CONSTANTS } from 'src/config';
import { DashboardReportRepoService } from './repositories/DashboardReportRepo.service';
import { DevicePoolRepoService } from './repositories/DevicePoolRepo.service';
import { DeviceRepoService } from './repositories/DeviceRepo.service';
import { UserRepoService } from './repositories/UserRepo.service';
import { DevicePool, DevicePoolSchema } from './schemas/device-pool.schema';
import { Device, DeviceSchema } from './schemas/device.schema';
import { User, UserSchema } from './schemas/user.schema';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        socket: {
          host: configService.get<string>(ENV_CONSTANTS.REDIS_HOST),
          port: configService.get<number>(ENV_CONSTANTS.REDIS_PORT),
        },
        auth_pass: configService.get<string>(ENV_CONSTANTS.REDIS_PASS),
        isGlobal: true,
        ttl: DEFAULT_CACHE_TTL,
      }),
    }),
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: DevicePool.name, schema: DevicePoolSchema },
        { name: Device.name, schema: DeviceSchema },
      ],
      STRING_CONSTANTS.MAIN_DOC_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    UserRepoService,
    DevicePoolRepoService,
    DeviceRepoService,
    DashboardReportRepoService,
  ],
  exports: [
    MongooseModule,
    UserRepoService,
    DevicePoolRepoService,
    DeviceRepoService,
    DashboardReportRepoService,
  ],
})
export class DatabaseModule {}
