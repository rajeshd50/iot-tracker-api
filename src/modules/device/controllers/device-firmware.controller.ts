import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { nanoid } from 'nanoid';
import * as path from 'path';
import { diskStorage } from 'multer';

import { FileInterceptor } from '@nestjs/platform-express';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { AddFirmwareDto } from '../dto/firmware/add-firmware.dto';
import { DeleteFirmwareDto } from '../dto/firmware/delete-firmware.dto';
import { FetchFirmwareDto } from '../dto/firmware/fetch-firmware.dto';
import { SyncFirmwareDto } from '../dto/firmware/sync-firmware.dto';
import { DeviceFirmwareService } from '../services/device-firmware.service';
import { FirmwareGenerateLinkDto } from '../dto/firmware/firmware-generate-link.dto';
import { FirmwareSyncListDto } from '../dto/firmware/firmware-sync-list.dto';

@Controller('firmware')
export class DeviceFirmwareController {
  constructor(private deviceFirmwareService: DeviceFirmwareService) {}

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(null, path.join(__dirname, '../../../../uploads'));
        },
        filename: function (req, file, cb) {
          cb(
            null,
            nanoid() + '_' + Date.now() + path.extname(file.originalname),
          );
        },
      }),
    }),
  )
  @Post('add')
  async create(
    @Body() data: AddFirmwareDto,
    @UserData() user,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.deviceFirmwareService.create(data, file, user);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('remove')
  async deleteFirmware(@Body() data: DeleteFirmwareDto) {
    return this.deviceFirmwareService.deleteFirmware(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('fetch')
  async fetchAllFirmware(@Body() data: FetchFirmwareDto) {
    return this.deviceFirmwareService.fetchAllFirmware(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('sync')
  async syncFirmware(@Body() data: SyncFirmwareDto, @UserData() user) {
    return this.deviceFirmwareService.syncFirmware(data, user);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('regenerate-link')
  async regenerateLink(@Body() data: FirmwareGenerateLinkDto) {
    return this.deviceFirmwareService.regenerateLink(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('sync-list')
  async getFirmwareSyncList(@Body() data: FirmwareSyncListDto) {
    return this.deviceFirmwareService.getFirmwareSyncList(data);
  }
}
