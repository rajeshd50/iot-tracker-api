import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { DatabaseModule } from '../database/database.module';
import { DeviceFirmwareController } from './controllers/device-firmware.controller';
import { DevicePoolController } from './controllers/device-pool.controller';
import { DeviceController } from './controllers/device.controller';
import { GeoFenceController } from './controllers/geofence.controller';
import { DeviceTaskProcessor } from './processors/device.task.processor';
import { DeviceFirmwareService } from './services/device-firmware.service';
import { DevicePoolService } from './services/device-pool.service';
import { DeviceService } from './services/device.service';
import { GeoFenceService } from './services/geofence.service';

@Module({
  imports: [CoreModule, DatabaseModule],
  providers: [
    DevicePoolService,
    DeviceService,
    DeviceTaskProcessor,
    GeoFenceService,
    DeviceFirmwareService,
  ],
  controllers: [
    DevicePoolController,
    DeviceController,
    GeoFenceController,
    DeviceFirmwareController,
  ],
})
export class DeviceModule {}
