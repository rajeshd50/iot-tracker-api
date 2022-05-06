import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DeleteDevicePoolDto } from '../dto/delete-device-pool.dto';
import { DevicePoolMarkAsConfiguredDto } from '../dto/device-pool.mark.configured.dto';
import { FetchDevicePoolDto } from '../dto/fetch-device-pool.dto';
import { DevicePoolService } from '../services/device-pool.service';

@Controller('device-pool')
export class DevicePoolController {
  constructor(private devicePoolService: DevicePoolService) {}

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async getAllUsers() {
    return this.devicePoolService.createNewDevice();
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('mark-configured')
  async markAsConfigured(@Body() data: DevicePoolMarkAsConfiguredDto) {
    return this.devicePoolService.markAsConfigured(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('fetch')
  async fetch(@Body() data: FetchDevicePoolDto) {
    return this.devicePoolService.fetch(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async delete(@Body() data: DeleteDevicePoolDto) {
    return this.devicePoolService.delete(data);
  }
}
