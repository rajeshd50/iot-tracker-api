import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { DatabaseModule } from '../database/database.module';
import { DevicePoolController } from './controllers/device-pool.controller';
import { DeviceController } from './controllers/device.controller';
import { GeoFenceController } from './controllers/geofence.controller';
import { DeviceTaskProcessor } from './processors/device.task.processor';
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
  ],
  controllers: [DevicePoolController, DeviceController, GeoFenceController],
})
export class DeviceModule {}
