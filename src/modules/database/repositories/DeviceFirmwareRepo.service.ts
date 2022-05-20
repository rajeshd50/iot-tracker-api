import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { desc as SemverSortDesc } from 'semver-sort';

import {
  Model,
  FilterQuery,
  AnyKeys,
  Types,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { Cache } from 'cache-manager';
import {
  CACHE_CONSTANTS,
  DEFAULT_PER_PAGE,
  ROLE,
  SITE_CONFIG,
} from 'src/config';
import {
  DeviceFirmware,
  DeviceFirmwareDocument,
} from '../schemas/device-firmware.schema';
import {
  DeviceFirmwareSync,
  DeviceFirmwareSyncDocument,
} from '../schemas/device-firmware-sync.schema';

@Injectable()
export class DeviceFirmwareRepoService {
  private logger = new Logger(DeviceFirmwareRepoService.name);
  constructor(
    @InjectModel(DeviceFirmware.name)
    private deviceFirmwareModel: Model<DeviceFirmwareDocument>,
    @InjectModel(DeviceFirmwareSync.name)
    private deviceFirmwareSyncModel: Model<DeviceFirmwareSyncDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async findOne(
    query: FilterQuery<DeviceFirmwareDocument>,
    projection: ProjectionType<DeviceFirmwareDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      const resp = await this.deviceFirmwareModel
        .findOne(query, projection, options)
        .populate(['createdBy']);
      return resp ? resp.toObject() : resp;
    } catch (error) {
      this.logger.error(`Error while finding device firmware`, error);
      throw error;
    }
  }

  public async create(data: AnyKeys<DeviceFirmwareDocument>) {
    try {
      const firmwareCreated = await this.deviceFirmwareModel.create(data);
      await this.updateIsLatestForNewAddUpdate(firmwareCreated._id);
      return this.findById(firmwareCreated._id);
    } catch (error) {
      this.logger.error(`Error while creating device firmware`, error);
      throw error;
    }
  }

  private async updateIsLatestForNewAddUpdate(newAddedId: string | object) {
    try {
      const existingLatest = await this.deviceFirmwareModel.findOne({
        isLatest: true,
        _id: {
          $ne: newAddedId,
        },
      });
      if (!existingLatest) {
        await this.findByIdAndUpdate(
          newAddedId,
          {
            isLatest: true,
          },
          true,
        );
      } else {
        const addedFirmware = await this.findById(newAddedId);
        const latestVersion = SemverSortDesc([
          addedFirmware.version,
          existingLatest.version,
        ])[0];

        if (latestVersion === addedFirmware.version) {
          await this.findByIdAndUpdate(
            addedFirmware.id,
            { isLatest: true },
            true,
          );
          await this.findByIdAndUpdate(
            existingLatest.id,
            { isLatest: false },
            true,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error while updating device firmware is latest flag`,
        error,
      );
      throw error;
    }
  }

  private async updateIsLatestAfterDelete() {
    try {
      const existingLatest = await this.deviceFirmwareModel.findOne({
        isLatest: true,
      });
      if (!existingLatest) {
        const allFirmware = await this.deviceFirmwareModel.find({});
        const latestVersion = allFirmware.length
          ? SemverSortDesc(allFirmware.map((f) => f.version))[0]
          : null;
        if (latestVersion) {
          const findObj = allFirmware.find((f) => f.version === latestVersion);
          if (findObj) {
            await this.findByIdAndUpdate(findObj._id, { isLatest: true }, true);
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error while updating device firmware is latest flag after delete`,
        error,
      );
      throw error;
    }
  }

  public async findById(
    id: string | object,
    projection: ProjectionType<DeviceFirmwareDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      const fenceData = await this.deviceFirmwareModel
        .findById(id, projection, options)
        .populate(['createdBy']);
      return fenceData ? fenceData.toObject() : fenceData;
    } catch (error) {
      this.logger.error(`Error while finding firmware by id`, error);
      throw error;
    }
  }

  public async findByVersion(
    version: string,
    projection: ProjectionType<DeviceFirmwareDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      const fenceData = await this.deviceFirmwareModel
        .findOne({ version }, projection, options)
        .populate(['createdBy']);
      return fenceData ? fenceData.toObject() : fenceData;
    } catch (error) {
      this.logger.error(`Error while finding firmware by version`, error);
      throw error;
    }
  }

  public async findAll(
    query: FilterQuery<DeviceFirmwareDocument>,
    projection: ProjectionType<DeviceFirmwareDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.deviceFirmwareModel
        .find(query, projection, {
          ...options,
          lean: true,
        })
        .populate(['createdBy']);
    } catch (error) {
      this.logger.error(`Error while finding device firmware`, error);
      throw error;
    }
  }

  public async paginate(
    query: FilterQuery<DeviceFirmwareDocument>,
    projection: ProjectionType<DeviceFirmwareDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.deviceFirmwareModel.countDocuments(query);
      const deviceFirmware = await this.deviceFirmwareModel
        .find(query, projection, {
          ...options,
          skip,
          limit,
        })
        .populate(['createdBy']);
      return {
        total,
        page,
        perPage: limit,
        items: deviceFirmware.map((dp) => dp.toObject()),
      };
    } catch (error) {
      this.logger.error(`Error while finding device firmwares`, error);
      throw error;
    }
  }

  public async delete(query: FilterQuery<DeviceFirmwareDocument>) {
    try {
      await this.deviceFirmwareModel.deleteMany(query);
      await this.updateIsLatestAfterDelete();
    } catch (error) {
      this.logger.error(`Error while deleting device firmwares`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<DeviceFirmwareDocument>,
    ignoreSubSequentUpdate = false,
  ) {
    try {
      await this.deviceFirmwareModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
        },
      );
      if (!ignoreSubSequentUpdate) {
        await this.updateIsLatestForNewAddUpdate(id);
      }
      return this.findById(id);
    } catch (error) {
      this.logger.error(`Error while updating device firmware`, error);
      throw error;
    }
  }

  public async createSync(data: AnyKeys<DeviceFirmwareSyncDocument>) {
    try {
      const firmwareSyncCreated = await this.deviceFirmwareSyncModel.create(
        data,
      );
      return firmwareSyncCreated;
    } catch (error) {
      this.logger.error(`Error while creating device firmware sync`, error);
      throw error;
    }
  }

  public async findAllSync(
    query: FilterQuery<DeviceFirmwareSyncDocument>,
    projection: ProjectionType<DeviceFirmwareSyncDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.deviceFirmwareSyncModel
        .find(query, projection, {
          ...options,
          lean: true,
        })
        .sort('-createdAt')
        .populate(['syncBy']);
    } catch (error) {
      this.logger.error(`Error while finding device firmware sync`, error);
      throw error;
    }
  }
}
