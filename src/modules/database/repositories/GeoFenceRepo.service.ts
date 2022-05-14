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
import {
  CACHE_CONSTANTS,
  DEFAULT_PER_PAGE,
  ROLE,
  SITE_CONFIG,
} from 'src/config';
import { GeoFence, GeoFenceDocument } from '../schemas/geofence.schema';

@Injectable()
export class GeoFenceRepoService {
  private logger = new Logger(GeoFenceRepoService.name);
  constructor(
    @InjectModel(GeoFence.name)
    private geoFenceModel: Model<GeoFenceDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async findOne(
    query: FilterQuery<GeoFenceDocument>,
    projection: ProjectionType<GeoFenceDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      const resp = await this.geoFenceModel
        .findOne(query, projection, options)
        .populate('user');
      return resp ? resp.toObject() : resp;
    } catch (error) {
      this.logger.error(`Error while finding geo fence`, error);
      throw error;
    }
  }

  public async create(data: AnyKeys<GeoFenceDocument>) {
    try {
      const geoFenceCreated = await this.geoFenceModel.create(data);
      return this.findById(geoFenceCreated._id);
    } catch (error) {
      this.logger.error(`Error while creating geo fence`, error);
      throw error;
    }
  }

  public async findById(
    id: string | object,
    projection: ProjectionType<GeoFenceDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      const fenceData = await this.geoFenceModel
        .findById(id, projection, options)
        .populate('user');
      return fenceData;
    } catch (error) {
      this.logger.error(`Error while finding fence by id`, error);
      throw error;
    }
  }

  public async findAll(
    query: FilterQuery<GeoFenceDocument>,
    projection: ProjectionType<GeoFenceDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.geoFenceModel
        .find(query, projection, {
          ...options,
          lean: true,
        })
        .populate('user');
    } catch (error) {
      this.logger.error(`Error while finding geo fence`, error);
      throw error;
    }
  }

  public async paginate(
    query: FilterQuery<GeoFenceDocument>,
    projection: ProjectionType<GeoFenceDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.geoFenceModel.countDocuments(query);
      const geoFences = await this.geoFenceModel
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
        items: geoFences.map((dp) => dp.toObject()),
      };
    } catch (error) {
      this.logger.error(`Error while finding geo fences`, error);
      throw error;
    }
  }

  public async delete(query: FilterQuery<GeoFenceDocument>) {
    try {
      await this.geoFenceModel.deleteMany(query);
    } catch (error) {
      this.logger.error(`Error while deleting geo fences`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<GeoFenceDocument>,
  ) {
    try {
      await this.geoFenceModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
        },
      );
      return this.findById(id);
    } catch (error) {
      this.logger.error(`Error while updating geo fence`, error);
      throw error;
    }
  }

  public async addDeviceToGeoFence(
    deviceSerial: string,
    geoFenceId: string | object,
  ) {
    try {
      await this.geoFenceModel.updateOne(
        {
          _id: geoFenceId,
        },
        {
          $push: {
            attachedDeviceSerials: deviceSerial,
          },
        },
      );
      return this.findById(geoFenceId, null, {});
    } catch (error) {
      this.logger.error(`Error while adding device serial to geo fence`, error);
      throw error;
    }
  }

  public async removeDeviceFromGeoFence(
    deviceSerial: string,
    geoFenceId: string | object,
  ) {
    try {
      await this.geoFenceModel.updateOne(
        {
          _id: geoFenceId,
        },
        {
          $pull: {
            attachedDeviceSerials: deviceSerial,
          },
        },
      );
      return this.findById(geoFenceId, null, {});
    } catch (error) {
      this.logger.error(
        `Error while removing device serial to geo fence`,
        error,
      );
      throw error;
    }
  }

  public async pullDeviceSerialId(deviceSerial: string) {
    try {
      await this.geoFenceModel.updateMany(
        {
          attachedDeviceSerials: deviceSerial,
        },
        {
          $pull: {
            attachedDeviceSerials: deviceSerial,
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `Error while deleting device serial from geo fence`,
        error,
      );
      throw error;
    }
  }
}
