import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { add } from 'date-fns';
import { FilterQuery, AnyKeys } from 'mongoose';
import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { AwsS3Service } from 'src/modules/core/services/aws.s3.service';
import { DeviceFirmwareRepoService } from 'src/modules/database/repositories/DeviceFirmwareRepo.service';
import { DeviceRepoService } from 'src/modules/database/repositories/DeviceRepo.service';
import {
  DeviceFirmwareDocument,
  DeviceFirmwareSyncStatus,
} from 'src/modules/database/schemas/device-firmware.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AddFirmwareDto } from '../dto/firmware/add-firmware.dto';
import { DeleteFirmwareDto } from '../dto/firmware/delete-firmware.dto';
import { FetchFirmwareDto } from '../dto/firmware/fetch-firmware.dto';
import { FirmwareGenerateLinkDto } from '../dto/firmware/firmware-generate-link.dto';
import { FirmwareSyncListDto } from '../dto/firmware/firmware-sync-list.dto';
import { SyncFirmwareDto } from '../dto/firmware/sync-firmware.dto';
import { DeviceFirmwareSyncEntity } from '../entities/device-firmware-sync.entity';
import { DeviceFirmwareEntity } from '../entities/device-firmware.entity';
import { DeviceFirmwareListEntity } from '../entities/device-firmware.list.entity';
import { getUniqueDeviceSyncJobId } from '../utils/utils';

@Injectable()
export class DeviceFirmwareService {
  private logger = new Logger(DeviceFirmwareService.name);

  constructor(
    @Inject(forwardRef(() => DeviceFirmwareRepoService))
    private firmwareRepoService: DeviceFirmwareRepoService,
    @Inject(forwardRef(() => DeviceRepoService))
    private deviceRepoService: DeviceRepoService,
    @Inject(forwardRef(() => AwsS3Service))
    private s3Service: AwsS3Service,
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
      const version = this.serializeVersion(data.version);
      const existingFirmware = await this.firmwareRepoService.findByVersion(
        version,
      );
      if (existingFirmware) {
        throw new HttpException(
          'Version already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      const fileUploadResp = await this.s3Service.uploadFile({
        fileName: `${version}/${file.filename}`,
        filePath: file.path,
      });
      const presignedExpiresIn = 3600 * 24 * 6;
      const presignedUrl = await this.s3Service.getPresignedUrl(
        fileUploadResp.url,
        presignedExpiresIn,
      );
      const firmware = await this.firmwareRepoService.create({
        version,
        key: fileUploadResp.key,
        etag: fileUploadResp.etag,
        fileUrl: fileUploadResp.url,
        createdBy: userEntity.id,
        signedUrl: presignedUrl,
        signedUrlExpiresAt: add(new Date(), {
          seconds: presignedExpiresIn,
        }),
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
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const deviceCount = data.isAllDeviceSelected
        ? await this.deviceRepoService.count({})
        : (data.attachedDevices || []).length;
      await this.firmwareRepoService.createSync({
        firmware: firmware._id,
        syncJobId: getUniqueDeviceSyncJobId(),
        syncBy: userEntity.id,
        isAllDeviceSelected: data.isAllDeviceSelected,
        attachedDevices: data.attachedDevices || [],
        totalDeviceCount: deviceCount,
      });
      const updatedFirmware = await this.firmwareRepoService.findByIdAndUpdate(
        data.id,
        {
          syncStatus: DeviceFirmwareSyncStatus.SYNCED,
          syncAt: new Date(),
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

  public async regenerateLink(
    data: FirmwareGenerateLinkDto,
  ): Promise<ApiResponse> {
    try {
      const firmware = await this.firmwareRepoService.findOne({
        _id: data.id,
      });
      if (!firmware) {
        throw new HttpException('Invalid geo firmware', HttpStatus.BAD_REQUEST);
      }
      const presignedExpiresIn = 3600 * 24 * 6;
      const presignedUrl = await this.s3Service.getPresignedUrl(
        firmware.fileUrl,
        presignedExpiresIn,
      );
      const updatedFirmware = await this.firmwareRepoService.findByIdAndUpdate(
        firmware._id,
        {
          signedUrl: presignedUrl,
          signedUrlExpiresAt: add(new Date(), {
            seconds: presignedExpiresIn,
          }),
        },
      );
      return ApiSuccessResponse(
        new DeviceFirmwareEntity(updatedFirmware),
        'Device firmware link generated',
      );
    } catch (error) {
      this.logger.error(`Unable to generate link for firmware entry`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to generate link for firmware entry',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async getFirmwareSyncList(
    data: FirmwareSyncListDto,
  ): Promise<ApiResponse> {
    try {
      const firmware = await this.firmwareRepoService.findOne({
        _id: data.id,
      });
      if (!firmware) {
        throw new HttpException('Invalid geo firmware', HttpStatus.BAD_REQUEST);
      }
      const syncList = await this.firmwareRepoService.findAllSync({
        firmware: firmware._id,
      });
      return ApiSuccessResponse(
        syncList.map((sl) => new DeviceFirmwareSyncEntity(sl)),
        'Device firmware sync list',
      );
    } catch (error) {
      this.logger.error(`Unable to fetch device firmware sync list`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch device firmware sync list',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
