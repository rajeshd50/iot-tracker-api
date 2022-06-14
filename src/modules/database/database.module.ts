import { Global, Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-redis-store';

import { DEFAULT_CACHE_TTL, ENV_CONSTANTS, STRING_CONSTANTS } from 'src/config';
import { DashboardReportRepoService } from './repositories/DashboardReportRepo.service';
import { DeviceFirmwareRepoService } from './repositories/DeviceFirmwareRepo.service';
import { DevicePoolRepoService } from './repositories/DevicePoolRepo.service';
import { DeviceRepoService } from './repositories/DeviceRepo.service';
import { GeoFenceRepoService } from './repositories/GeoFenceRepo.service';
import { SiteConfigRepoService } from './repositories/SiteConfigRepo.service';
import { SupportTicketRepoService } from './repositories/SupportTicketRepo.service';
import { UserLimitRepoService } from './repositories/UserLimitRepo.service';
import { UserRepoService } from './repositories/UserRepo.service';
import {
  DeviceFirmwareSync,
  DeviceFirmwareSyncSchema,
} from './schemas/device-firmware-sync.schema';
import {
  DeviceFirmware,
  DeviceFirmwareSchema,
} from './schemas/device-firmware.schema';
import { DevicePool, DevicePoolSchema } from './schemas/device-pool.schema';
import { Device, DeviceSchema } from './schemas/device.schema';
import { GeoFence, GeoFenceSchema } from './schemas/geofence.schema';
import { SiteConfig, SiteConfigSchema } from './schemas/site-config.schema';
import {
  SupportTicket,
  SupportTicketSchema,
} from './schemas/support-ticket.schema';
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
        { name: SiteConfig.name, schema: SiteConfigSchema },
        { name: GeoFence.name, schema: GeoFenceSchema },
        { name: DeviceFirmware.name, schema: DeviceFirmwareSchema },
        { name: DeviceFirmwareSync.name, schema: DeviceFirmwareSyncSchema },
        { name: SupportTicket.name, schema: SupportTicketSchema },
      ],
      STRING_CONSTANTS.MAIN_DOC_DB_CONNECTION_NAME,
    ),
  ],
  providers: [
    UserRepoService,
    DevicePoolRepoService,
    DeviceRepoService,
    DashboardReportRepoService,
    SiteConfigRepoService,
    GeoFenceRepoService,
    DeviceFirmwareRepoService,
    UserLimitRepoService,
    SupportTicketRepoService,
  ],
  exports: [
    MongooseModule,
    UserRepoService,
    DevicePoolRepoService,
    DeviceRepoService,
    DashboardReportRepoService,
    SiteConfigRepoService,
    GeoFenceRepoService,
    DeviceFirmwareRepoService,
    UserLimitRepoService,
    SupportTicketRepoService,
  ],
})
export class DatabaseModule {}
