import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  FilterQuery,
  AnyKeys,
  Types,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_CONSTANTS, DEFAULT_PER_PAGE } from 'src/config';
import { DevicePool, DevicePoolDocument } from '../schemas/device-pool.schema';

@Injectable()
export class DevicePoolRepoService {
  private logger = new Logger(DevicePoolRepoService.name);
  constructor(
    @InjectModel(DevicePool.name)
    private devicePoolModel: Model<DevicePoolDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async findOne(
    query: FilterQuery<DevicePoolDocument>,
    projection: ProjectionType<DevicePoolDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.devicePoolModel.findOne(query, projection, options);
    } catch (error) {
      this.logger.error(`Error while finding device pool`, error);
      throw error;
    }
  }

  public async findBySerial(
    serial: string,
    projection: ProjectionType<DevicePoolDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      let devicePoolData: DevicePoolDocument = null;
      devicePoolData = await this.cacheManager.get(
        CACHE_CONSTANTS.DEVICE_POOL.BY_SERIAL(serial.toLocaleUpperCase()),
      );
      if (!devicePoolData) {
        devicePoolData = await this.devicePoolModel.findOne(
          {
            serial: serial.toLocaleUpperCase(),
          },
          projection,
          options,
        );
        if (devicePoolData) {
          await this.cacheManager.set(
            CACHE_CONSTANTS.DEVICE_POOL.BY_SERIAL(serial.toLocaleUpperCase()),
            devicePoolData.toObject(),
          );
        }
      }
      return devicePoolData;
    } catch (error) {
      this.logger.error(`Error while finding device pool by serial`, error);
      throw error;
    }
  }

  public async create(data: AnyKeys<DevicePoolDocument>) {
    try {
      const devicePoolCreated = await this.devicePoolModel.create(data);
      await this.setDevicePoolCache(devicePoolCreated);
      return devicePoolCreated;
    } catch (error) {
      this.logger.error(`Error while creating device pool`, error);
      throw error;
    }
  }

  public async findAll(
    query: FilterQuery<DevicePoolDocument>,
    projection: ProjectionType<DevicePoolDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.devicePoolModel.find(query, projection, options);
    } catch (error) {
      this.logger.error(`Error while finding device pool`, error);
      throw error;
    }
  }

  public async paginate(
    query: FilterQuery<DevicePoolDocument>,
    projection: ProjectionType<DevicePoolDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.devicePoolModel.countDocuments(query);
      const devicePools = await this.devicePoolModel.find(query, projection, {
        ...options,
        skip,
        limit,
      });
      return {
        total,
        page,
        perPage: limit,
        items: devicePools.map((dp) => dp.toObject()),
      };
    } catch (error) {
      this.logger.error(`Error while finding device pool`, error);
      throw error;
    }
  }

  public async delete(query: FilterQuery<DevicePoolDocument>) {
    try {
      const devicePools = await this.devicePoolModel.find(query);
      await this.devicePoolModel.deleteMany(query);
      for (let i = 0; i < devicePools.length; i++) {
        await this.deleteDevicePoolCache(devicePools[i]);
      }
    } catch (error) {
      this.logger.error(`Error while deleting device pools`, error);
      throw error;
    }
  }

  public async findBySerialAndUpdate(
    serial: string,
    updateData: AnyKeys<DevicePoolDocument>,
  ) {
    try {
      const devicePool = await this.findBySerial(serial);
      return this.findByIdAndUpdate(devicePool._id, updateData);
    } catch (error) {
      this.logger.error(`Error while updating device pool by serial`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<DevicePoolDocument>,
  ) {
    try {
      const updatedDevicePoolData =
        await this.devicePoolModel.findByIdAndUpdate(
          id,
          {
            ...updateData,
          },
          {
            new: true,
          },
        );
      await this.setDevicePoolCache(updatedDevicePoolData);
      return updatedDevicePoolData;
    } catch (error) {
      this.logger.error(`Error while updating device pool`, error);
      throw error;
    }
  }

  private async setDevicePoolCache(devicePoolData: DevicePoolDocument) {
    try {
      await this.cacheManager.set(
        CACHE_CONSTANTS.DEVICE_POOL.BY_SERIAL(devicePoolData.serial),
        devicePoolData,
      );
      await this.cacheManager.set(
        CACHE_CONSTANTS.DEVICE_POOL.BY_ID(devicePoolData._id),
        devicePoolData,
      );
    } catch (error) {
      this.logger.error(`Error while setting device pool cache`, error);
      throw error;
    }
  }

  private async deleteDevicePoolCache(devicePoolData: DevicePoolDocument) {
    try {
      await this.cacheManager.del(
        CACHE_CONSTANTS.DEVICE_POOL.BY_SERIAL(devicePoolData.serial),
      );
      await this.cacheManager.del(
        CACHE_CONSTANTS.DEVICE_POOL.BY_ID(devicePoolData._id),
      );
    } catch (error) {
      this.logger.error(`Error while deleting device pool cache`, error);
      throw error;
    }
  }
}
