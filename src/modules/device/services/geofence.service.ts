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
import { DeviceRepoService } from 'src/modules/database/repositories/DeviceRepo.service';
import { GeoFenceRepoService } from 'src/modules/database/repositories/GeoFenceRepo.service';
import { GeoFenceDocument } from 'src/modules/database/schemas/geofence.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AddGeoFenceDto } from '../dto/geofence/add-geo-fence.dto';
import { DeleteGeoFenceDto } from '../dto/geofence/delete-geo-fence.dto';
import { FetchGeoFencesDto } from '../dto/geofence/fetch-geo-fence.dto';
import { GeoFenceDetailsDto } from '../dto/geofence/geo-fence-details.dto';
import { UpdateGeoFenceToDeviceDto } from '../dto/geofence/update-fence-to-device.dto';
import { UpdateGeoFenceDto } from '../dto/geofence/update-geo-fence.dto';
import { GeoFenceEntity } from '../entities/geofence.entity';
import { GeoFenceListEntity } from '../entities/geofence.list.entity';

@Injectable()
export class GeoFenceService {
  private logger = new Logger(GeoFenceService.name);

  constructor(
    @Inject(forwardRef(() => GeoFenceRepoService))
    private geoFenceRepoService: GeoFenceRepoService,
    @Inject(forwardRef(() => DeviceRepoService))
    private deviceRepoService: DeviceRepoService,
  ) {}

  public async create(
    data: AddGeoFenceDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const transformedCoordinates = data.coordinates.map((coordinate) => [
        coordinate.lng,
        coordinate.lat,
      ]);
      const fence = await this.geoFenceRepoService.create({
        name: data.name,
        user: userEntity.id,
        fence: {
          type: 'Polygon',
          coordinates: [transformedCoordinates],
        },
      });
      return ApiSuccessResponse(new GeoFenceEntity(fence), 'GeoFence created');
    } catch (error) {
      this.logger.error(`Unable to create new geo fence`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to create geo fence',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async update(
    data: UpdateGeoFenceDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const transformedCoordinates = data.coordinates.map((coordinate) => [
        coordinate.lng,
        coordinate.lat,
      ]);
      const fence = await this.geoFenceRepoService.findByIdAndUpdate(data.id, {
        name: data.name,
        user: userEntity.id,
        fence: {
          type: 'Polygon',
          coordinates: [transformedCoordinates],
        },
      });
      return ApiSuccessResponse(new GeoFenceEntity(fence), 'GeoFence updated');
    } catch (error) {
      this.logger.error(`Unable to update new geo fence`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update geo fence',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async getDetails(
    data: GeoFenceDetailsDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const fence = await this.geoFenceRepoService.findOne({
        _id: data.id,
        user: userEntity.id,
      });
      if (!fence) {
        throw new HttpException('Invalid geo fence', HttpStatus.BAD_REQUEST);
      }
      return ApiSuccessResponse(new GeoFenceEntity(fence), 'GeoFence details');
    } catch (error) {
      this.logger.error(`Unable to fetch geo fence`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch geo fence',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async fetchGeoFences(
    filter: FetchGeoFencesDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const query: FilterQuery<GeoFenceDocument> = {
        user: userEntity.id,
      };
      if (filter.name) {
        query.$or = [{ name: new RegExp(filter.name, 'i') }];
      }

      const paginatedFences = await this.geoFenceRepoService.paginate(
        query,
        null,
        { sort: '-createdAt' },
        filter.page,
        filter.perPage,
      );
      return ApiSuccessResponse(
        new GeoFenceListEntity({
          ...paginatedFences,
          items: paginatedFences.items.map((d) => new GeoFenceEntity(d)),
        }),
        'Geo fence list',
      );
    } catch (error) {
      this.logger.error(`Unable to fetch geo fences`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch geo fences',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async deleteFence(
    data: DeleteGeoFenceDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const fence = await this.geoFenceRepoService.findOne({
        _id: data.id,
        user: userEntity.id,
      });
      if (!fence) {
        throw new HttpException('Invalid geo fence', HttpStatus.BAD_REQUEST);
      }
      await this.geoFenceRepoService.delete({
        _id: data.id,
      });
      await this.deviceRepoService.pullGeoFenceId(data.id);
      return ApiSuccessResponse({}, 'GeoFence deleted');
    } catch (error) {
      this.logger.error(`Unable to delete geo fence`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to delete geo fence',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async addFenceToDevice(
    data: UpdateGeoFenceToDeviceDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const fence = await this.geoFenceRepoService.findOne({
        _id: data.fenceId,
        user: userEntity.id,
      });
      const device = await this.deviceRepoService.findOne({
        _id: data.deviceId,
        user: userEntity.id,
      });
      if (!fence) {
        throw new HttpException('Invalid geo fence', HttpStatus.BAD_REQUEST);
      }
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.BAD_REQUEST);
      }
      if (
        fence.attachedDeviceSerials &&
        fence.attachedDeviceSerials.includes(device.serial)
      ) {
        throw new HttpException(
          'Geo fence is already added to device',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.geoFenceRepoService.addDeviceToGeoFence(
        device.serial,
        fence._id,
      );
      await this.deviceRepoService.addGeoFenceToDevice(device._id, fence._id);
      return ApiSuccessResponse(
        new GeoFenceEntity(fence),
        'GeoFence added to device',
      );
    } catch (error) {
      this.logger.error(`Unable to add geo fence to device`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to add geo fence to device',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async removeFenceFromDevice(
    data: UpdateGeoFenceToDeviceDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const fence = await this.geoFenceRepoService.findOne({
        _id: data.fenceId,
        user: userEntity.id,
      });
      const device = await this.deviceRepoService.findOne({
        _id: data.deviceId,
        user: userEntity.id,
      });
      if (!fence) {
        throw new HttpException('Invalid geo fence', HttpStatus.BAD_REQUEST);
      }
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.BAD_REQUEST);
      }
      if (
        fence.attachedDeviceSerials &&
        !fence.attachedDeviceSerials.includes(device.serial)
      ) {
        throw new HttpException(
          'Geo fence is not added to device',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.geoFenceRepoService.removeDeviceFromGeoFence(
        device.serial,
        fence._id,
      );
      await this.deviceRepoService.removeGeoFenceFromDevice(
        device._id,
        fence._id,
      );
      return ApiSuccessResponse(
        new GeoFenceEntity(fence),
        'GeoFence removed from device',
      );
    } catch (error) {
      this.logger.error(`Unable to remove geo fence from device`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to remove geo fence from device',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
