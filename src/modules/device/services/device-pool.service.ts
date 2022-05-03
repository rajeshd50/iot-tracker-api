import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';

import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { DevicePoolStatus } from 'src/config';
import { DevicePoolRepoService } from 'src/modules/database/repositories/DevicePoolRepo.service';
import { DeviceRepoService } from 'src/modules/database/repositories/DeviceRepo.service';
import { DevicePoolDocument } from 'src/modules/database/schemas/device-pool.schema';
import { DevicePoolMarkAsConfiguredDto } from '../dto/device-pool.mark.configured.dto';
import { FetchDevicePoolDto } from '../dto/fetch-device-pool.dto';
import { DevicePoolEntity } from '../entities/device-pool.entity';
import { DevicePoolListEntity } from '../entities/device-pool.list.entity';
import { getUniqueDeviceSerialNumber } from '../utils/utils';

@Injectable()
export class DevicePoolService {
  private logger = new Logger(DevicePoolService.name);

  constructor(
    @Inject(forwardRef(() => DevicePoolRepoService))
    private devicePoolRepoService: DevicePoolRepoService,
    @Inject(forwardRef(() => DeviceRepoService))
    private deviceRepoService: DeviceRepoService,
  ) {}

  public async createNewDevice(): Promise<ApiResponse> {
    try {
      const devicePool = await this.devicePoolRepoService.create({
        serial: getUniqueDeviceSerialNumber(),
        status: DevicePoolStatus.CREATED,
      });
      return ApiSuccessResponse(
        new DevicePoolEntity(devicePool.toObject()),
        'Device pool created',
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(`Unable to create new device pool`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to create device pool',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async markAsConfigured({
    serial,
  }: DevicePoolMarkAsConfiguredDto): Promise<ApiResponse> {
    try {
      const devicePoolObj = await this.devicePoolRepoService.findBySerial(
        serial,
      );
      if (!devicePoolObj) {
        throw new HttpException('Invalid request', HttpStatus.NOT_FOUND);
      }
      if (devicePoolObj.status === DevicePoolStatus.CONFIGURED) {
        throw new HttpException('Already configured', HttpStatus.BAD_REQUEST);
      }
      await this.deviceRepoService.create({
        serial,
      });
      const devicePool = await this.devicePoolRepoService.findBySerialAndUpdate(
        serial,
        {
          status: DevicePoolStatus.CONFIGURED,
        },
      );
      return ApiSuccessResponse(
        new DevicePoolEntity(devicePool.toObject()),
        'Device pool updated',
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Unable to update device pool`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update device pool',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async fetch(filter: FetchDevicePoolDto): Promise<ApiResponse> {
    try {
      const query: FilterQuery<DevicePoolDocument> = {};
      if (filter.serial) {
        query.serial = filter.serial.toLocaleUpperCase();
      }
      if (filter.status) {
        query.status = filter.status;
      }
      const paginatedResponse = await this.devicePoolRepoService.paginate(
        query,
        null,
        {},
        filter.page,
        filter.perPage,
      );
      return ApiSuccessResponse(
        new DevicePoolListEntity({
          ...paginatedResponse,
          items: paginatedResponse.items.map((dp) => new DevicePoolEntity(dp)),
        }),
        'All device pools',
      );
    } catch (error) {
      this.logger.error(`Unable to fetch device pool`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch device pool',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
