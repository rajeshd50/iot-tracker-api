import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { DatabaseModule } from '../database/database.module';
import { DevicePoolController } from './controllers/device-pool.controller';
import { DeviceController } from './controllers/device.controller';
import { DevicePoolService } from './services/device-pool.service';
import { DeviceService } from './services/device.service';

@Module({
  imports: [CoreModule, DatabaseModule],
  providers: [DevicePoolService, DeviceService],
  controllers: [DevicePoolController, DeviceController],
})
export class DeviceModule {}
