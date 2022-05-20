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
import { Device, DeviceDocument } from '../schemas/device.schema';

@Injectable()
export class DeviceRepoService {
  private logger = new Logger(DeviceRepoService.name);
  constructor(
    @InjectModel(Device.name)
    private deviceModel: Model<DeviceDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async findOne(
    query: FilterQuery<DeviceDocument>,
    projection: ProjectionType<DeviceDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      const deviceData = await this.deviceModel
        .findOne(query, projection, options)
        .populate('user');
      return deviceData ? deviceData.toObject() : deviceData;
    } catch (error) {
      this.logger.error(`Error while finding device`, error);
      throw error;
    }
  }

  public async count(query: FilterQuery<DeviceDocument>) {
    try {
      const deviceCount = await this.deviceModel.countDocuments(query);
      return deviceCount || 0;
    } catch (error) {
      this.logger.error(`Error while counting device`, error);
      throw error;
    }
  }

  public async findBySerial(
    serial: string,
    projection: ProjectionType<DeviceDocument> = null,
    options: QueryOptions = {},
    refreshCache = false,
  ) {
    try {
      let deviceData: DeviceDocument = null;
      if (!refreshCache) {
        deviceData = await this.cacheManager.get(
          CACHE_CONSTANTS.DEVICE.BY_SERIAL(serial.toLocaleUpperCase()),
        );
      }
      if (!deviceData) {
        deviceData = await this.deviceModel
          .findOne(
            {
              serial: serial.toLocaleUpperCase(),
            },
            projection,
            { ...options, lean: true },
          )
          .populate('user');
        if (deviceData) {
          await this.cacheManager.set(
            CACHE_CONSTANTS.DEVICE.BY_SERIAL(serial.toLocaleUpperCase()),
            deviceData,
          );
        }
      }
      return deviceData;
    } catch (error) {
      this.logger.error(`Error while finding device by serial`, error);
      throw error;
    }
  }

  public async findById(
    id: string | object,
    projection: ProjectionType<DeviceDocument> = null,
    options: QueryOptions = {},
    refreshCache = false,
  ) {
    try {
      let deviceData: DeviceDocument = null;
      if (!refreshCache) {
        deviceData = await this.cacheManager.get(
          CACHE_CONSTANTS.DEVICE.BY_ID(id.toString()),
        );
      }
      if (!deviceData) {
        deviceData = await this.deviceModel
          .findById(id, projection, options)
          .populate('user');
        if (deviceData) {
          await this.cacheManager.set(
            CACHE_CONSTANTS.DEVICE.BY_ID(id.toString()),
            deviceData.toObject(),
          );
        }
      }
      return deviceData;
    } catch (error) {
      this.logger.error(`Error while finding device by id`, error);
      throw error;
    }
  }

  public async create(data: AnyKeys<DeviceDocument>) {
    try {
      const deviceCreated = await this.deviceModel.create(data);
      await this.setDeviceCache(deviceCreated);
      return deviceCreated;
    } catch (error) {
      this.logger.error(`Error while creating device`, error);
      throw error;
    }
  }

  public async findAll(
    query: FilterQuery<DeviceDocument>,
    projection: ProjectionType<DeviceDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.deviceModel.find(query, projection, options).populate('user');
    } catch (error) {
      this.logger.error(`Error while finding device`, error);
      throw error;
    }
  }

  public async paginate(
    query: FilterQuery<DeviceDocument>,
    projection: ProjectionType<DeviceDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.deviceModel.countDocuments(query);
      const devices = await this.deviceModel
        .find(query, projection, {
          ...options,
          skip,
          limit,
        })
        .populate('user');
      return {
        total,
        page,
        perPage: limit,
        items: devices.map((dp) => dp.toObject()),
      };
    } catch (error) {
      this.logger.error(`Error while finding devices`, error);
      throw error;
    }
  }

  public async findBySerialAndUpdate(
    serial: string,
    updateData: AnyKeys<DeviceDocument>,
  ) {
    try {
      const device = await this.findBySerial(serial);
      return this.findByIdAndUpdate(device._id, updateData);
    } catch (error) {
      this.logger.error(`Error while updating device by serial`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<DeviceDocument>,
  ) {
    try {
      await this.deviceModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
        },
      );
      const updatedDeviceData = await this.findById(id, null, {}, true);
      await this.setDeviceCache(updatedDeviceData);
      return updatedDeviceData;
    } catch (error) {
      this.logger.error(`Error while updating device`, error);
      throw error;
    }
  }

  public async delete(query: FilterQuery<DeviceDocument>) {
    try {
      const devices = await this.deviceModel.find(query);
      await this.deviceModel.deleteMany(query);
      for (let i = 0; i < devices.length; i++) {
        await this.deleteDeviceCache(devices[i]);
      }
    } catch (error) {
      this.logger.error(`Error while deleting devices`, error);
      throw error;
    }
  }

  public async addGeoFenceToDevice(
    deviceId: string | object,
    geoFenceId: string | object,
  ) {
    try {
      await this.deviceModel.updateOne(
        {
          _id: deviceId,
        },
        {
          $push: {
            attachedGeoFences: geoFenceId,
          },
        },
      );
      return this.findById(deviceId, null, {}, true);
    } catch (error) {
      this.logger.error(`Error while adding geo fence to the devices`, error);
      throw error;
    }
  }

  public async removeGeoFenceFromDevice(
    deviceId: string | object,
    geoFenceId: string | object,
  ) {
    try {
      await this.deviceModel.updateOne(
        {
          _id: deviceId,
        },
        {
          $pull: {
            attachedGeoFences: geoFenceId,
          },
        },
      );
      return this.findById(deviceId, null, {}, true);
    } catch (error) {
      this.logger.error(
        `Error while removing geo fence from the devices`,
        error,
      );
      throw error;
    }
  }

  public async pullGeoFenceId(geoFenceId: string | object) {
    try {
      const deviceWithGeoFence = await this.deviceModel.find({
        attachedGeoFences: geoFenceId,
      });
      if (deviceWithGeoFence.length) {
        await this.deviceModel.updateMany(
          {
            _id: {
              $in: deviceWithGeoFence.map((device) => device._id),
            },
          },
          {
            $pull: {
              attachedGeoFences: geoFenceId,
            },
          },
        );
        for (let i = 0; i < deviceWithGeoFence.length; i++) {
          await this.deleteDeviceCache(deviceWithGeoFence[i]);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error while deleting geo fence id from devices`,
        error,
      );
      throw error;
    }
  }

  private async setDeviceCache(deviceData: DeviceDocument) {
    try {
      await this.cacheManager.set(
        CACHE_CONSTANTS.DEVICE.BY_SERIAL(deviceData.serial),
        deviceData,
      );
      await this.cacheManager.set(
        CACHE_CONSTANTS.DEVICE.BY_ID(deviceData._id),
        deviceData,
      );
    } catch (error) {
      this.logger.error(`Error while setting device cache`, error);
      throw error;
    }
  }

  private async deleteDeviceCache(deviceData: DeviceDocument) {
    try {
      await this.cacheManager.del(
        CACHE_CONSTANTS.DEVICE.BY_SERIAL(deviceData.serial),
      );
      await this.cacheManager.del(CACHE_CONSTANTS.DEVICE.BY_ID(deviceData._id));
    } catch (error) {
      this.logger.error(`Error while deleting device cache`, error);
      throw error;
    }
  }
}
