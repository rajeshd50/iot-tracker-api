import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FilterQuery, AnyKeys } from 'mongoose';
import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { DeviceFirmwareRepoService } from 'src/modules/database/repositories/DeviceFirmwareRepo.service';
import {
  DeviceFirmwareDocument,
  DeviceFirmwareSyncStatus,
} from 'src/modules/database/schemas/device-firmware.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AddFirmwareDto } from '../dto/firmware/add-firmware.dto';
import { DeleteFirmwareDto } from '../dto/firmware/delete-firmware.dto';
import { FetchFirmwareDto } from '../dto/firmware/fetch-firmware.dto';
import { SyncFirmwareDto } from '../dto/firmware/sync-firmware.dto';
import { DeviceFirmwareEntity } from '../entities/device-firmware.entity';
import { DeviceFirmwareListEntity } from '../entities/device-firmware.list.entity';

@Injectable()
export class DeviceFirmwareService {
  private logger = new Logger(DeviceFirmwareService.name);

  constructor(
    @Inject(forwardRef(() => DeviceFirmwareRepoService))
    private firmwareRepoService: DeviceFirmwareRepoService,
  ) {}

  public async create(
    data: AddFirmwareDto,
    file: Express.Multer.File,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }
      const firmware = await this.firmwareRepoService.create({
        version: this.serializeVersion(data.version),
        filePath: file.path,
        fileUrl: file.path,
        createdBy: userEntity.id,
      });
      return ApiSuccessResponse(
        new DeviceFirmwareEntity(firmware),
        'Firmware entry created',
      );
    } catch (error) {
      this.logger.error(`Unable to create new firmware entity`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to create firmware entity',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private serializeVersion(version: string) {
    const updatedVersion = version.toLowerCase();
    if (updatedVersion.startsWith('v')) {
      return updatedVersion;
    }
    return `v${updatedVersion}`;
  }

  public async fetchAllFirmware(
    filter: FetchFirmwareDto,
  ): Promise<ApiResponse> {
    try {
      const query: FilterQuery<DeviceFirmwareDocument> = {};
      if (filter.version) {
        query.$or = [{ version: new RegExp(filter.version, 'i') }];
      }
      if (filter.syncStatus) {
        query.syncStatus = filter.syncStatus;
      }

      const paginatedFirmware = await this.firmwareRepoService.paginate(
        query,
        null,
        { sort: '-createdAt' },
        filter.page,
        filter.perPage,
      );
      return ApiSuccessResponse(
        new DeviceFirmwareListEntity({
          ...paginatedFirmware,
          items: paginatedFirmware.items.map(
            (d) => new DeviceFirmwareEntity(d),
          ),
        }),
        'Firmware list',
      );
    } catch (error) {
      this.logger.error(`Unable to fetch device firmware`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch device firmware',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async deleteFirmware(data: DeleteFirmwareDto): Promise<ApiResponse> {
    try {
      const firmware = await this.firmwareRepoService.findOne({
        _id: data.id,
      });
      if (!firmware) {
        throw new HttpException('Invalid geo firmware', HttpStatus.BAD_REQUEST);
      }
      if (firmware.syncStatus === DeviceFirmwareSyncStatus.SYNCED) {
        throw new HttpException(
          'Firmware is synced, can not delete',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.firmwareRepoService.delete({
        _id: data.id,
      });
      return ApiSuccessResponse({}, 'Device firmware entry deleted');
    } catch (error) {
      this.logger.error(`Unable to delete firmware entry`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to delete firmware entry',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async syncFirmware(
    data: SyncFirmwareDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const firmware = await this.firmwareRepoService.findOne({
        _id: data.id,
      });
      if (!firmware) {
        throw new HttpException('Invalid geo firmware', HttpStatus.BAD_REQUEST);
      }
      // TODO: start device firmware update
      const updatedFirmware = await this.firmwareRepoService.findByIdAndUpdate(
        data.id,
        {
          syncStatus: DeviceFirmwareSyncStatus.SYNCED,
          syncAt: new Date(),
          syncBy: userEntity.id,
        },
      );
      return ApiSuccessResponse(
        new DeviceFirmwareEntity(updatedFirmware),
        'Device firmware sync updated',
      );
    } catch (error) {
      this.logger.error(
        `Unable to update sync status of firmware entry`,
        error,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update sync status of firmware entry',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
