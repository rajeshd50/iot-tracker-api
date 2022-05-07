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

import { User, UserDocument } from '../schemas/user.schema';
import {
  CACHE_CONSTANTS,
  DEFAULT_PER_PAGE,
  DeviceAssignStatus,
  DeviceStatus,
} from 'src/config';
import { Device, DeviceDocument } from '../schemas/device.schema';

@Injectable()
export class UserRepoService {
  private logger = new Logger(UserRepoService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async findOne(
    query: FilterQuery<UserDocument>,
    projection: ProjectionType<UserDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.userModel.findOne(query, projection, options);
    } catch (error) {
      this.logger.error(`Error while finding user`, error);
      throw error;
    }
  }

  public async findByEmail(
    email: string,
    projection: ProjectionType<UserDocument> = null,
    options: QueryOptions = {},
    refreshCache = false,
  ) {
    try {
      let userData: UserDocument = null;
      if (!refreshCache) {
        userData = await this.cacheManager.get(
          CACHE_CONSTANTS.USER.BY_EMAIL(email),
        );
      }
      if (!userData) {
        userData = await this.userModel.findOne(
          {
            email,
          },
          projection,
          { ...options, lean: true },
        );
        if (userData) {
          await this.setUserCache(userData);
        }
      }
      return userData;
    } catch (error) {
      this.logger.error(`Error while finding user`, error);
      throw error;
    }
  }

  public async findById(
    id: string | object,
    projection: ProjectionType<UserDocument> = null,
    options: QueryOptions = {},
    refreshCache = false,
  ) {
    try {
      let userData: UserDocument = null;
      if (!refreshCache) {
        userData = await this.cacheManager.get(
          CACHE_CONSTANTS.USER.BY_ID(id.toString()),
        );
      }
      if (!userData) {
        userData = await this.userModel.findById(id, projection, {
          ...options,
          lean: true,
        });
        if (userData) {
          await this.setUserCache(userData);
        }
      }
      return userData;
    } catch (error) {
      this.logger.error(`Error while finding user by id`, error);
      throw error;
    }
  }

  public async create(data: AnyKeys<UserDocument>) {
    try {
      const userCreated = await this.userModel.create(data);
      return this.findById(userCreated._id);
    } catch (error) {
      this.logger.error(`Error while creating user`, error);
      throw error;
    }
  }

  public async findAll(
    query: FilterQuery<UserDocument>,
    projection: ProjectionType<UserDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.userModel.find(query, projection, options);
    } catch (error) {
      this.logger.error(`Error while finding user`, error);
      throw error;
    }
  }

  public async paginate(
    query: FilterQuery<UserDocument>,
    projection: ProjectionType<UserDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.userModel.countDocuments(query);
      const users = await this.userModel.find(query, projection, {
        ...options,
        skip,
        limit,
      });
      return {
        total,
        page,
        perPage: limit,
        items: users,
      };
    } catch (error) {
      this.logger.error(`Error while finding users`, error);
      throw error;
    }
  }

  public async paginateWithDeviceStat(
    query: FilterQuery<UserDocument>,
    projection: ProjectionType<UserDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.userModel.countDocuments(query);
      const users = await this.userModel.find(query, projection, {
        ...options,
        skip,
        limit,
      });

      const userWithDeviceStat = [];

      const deviceStats = await this.getDeviceStatsForUsers(
        users.map((user) => user._id),
      );
      users.forEach((user) => {
        const findStat = deviceStats.find(
          (ds) => String(ds._id) === String(user._id),
        );
        userWithDeviceStat.push({
          ...user,
          ...(findStat
            ? {
                totalDevice: findStat.total,
                activeDevice: findStat.active,
                inactiveDevice: findStat.total - findStat.active,
                pendingDevice: findStat.pendingApproval,
              }
            : {
                totalDevice: 0,
                activeDevice: 0,
                inactiveDevice: 0,
                pendingDevice: 0,
              }),
        });
      });
      return {
        total,
        page,
        perPage: limit,
        items: userWithDeviceStat,
      };
    } catch (error) {
      this.logger.error(`Error while finding users`, error);
      throw error;
    }
  }

  public async findByIdWithDeviceStat(id: string) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('Invalid user');
      }
      const userDeviceStat = await this.getDeviceStatsForUsers([user._id]);
      const findStat =
        userDeviceStat && userDeviceStat.length ? userDeviceStat[0] : null;
      return {
        ...user,
        ...(findStat
          ? {
              totalDevice: findStat.total,
              activeDevice: findStat.active,
              inactiveDevice: findStat.total - findStat.active,
              pendingDevice: findStat.pendingApproval,
            }
          : {
              totalDevice: 0,
              activeDevice: 0,
              inactiveDevice: 0,
              pendingDevice: 0,
            }),
      };
    } catch (error) {
      this.logger.error(`Error while finding user by id`, error);
      throw error;
    }
  }

  private async getDeviceStatsForUsers(userIds: any[]) {
    try {
      const result = await this.deviceModel.aggregate([
        {
          $match: {
            user: {
              $in: userIds,
            },
          },
        },
        {
          $group: {
            _id: '$user',
            total: {
              $sum: 1,
            },
            purchased: {
              $sum: {
                $cond: [
                  { $eq: ['$assignStatus', DeviceAssignStatus.ASSIGNED] },
                  1,
                  0,
                ],
              },
            },
            pendingApproval: {
              $sum: {
                $cond: [
                  {
                    $eq: ['$assignStatus', DeviceAssignStatus.PENDING_APPROVAL],
                  },
                  1,
                  0,
                ],
              },
            },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', DeviceStatus.ACTIVE] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            total: 1,
            purchased: 1,
            active: 1,
            pendingApproval: 1,
          },
        },
      ]);
      return result;
    } catch (error) {
      this.logger.error(`Error while finding device stat for user`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<UserDocument>,
  ) {
    try {
      await this.userModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
        },
      );
      const updatedUserData = await this.findById(id, null, {}, true);
      return updatedUserData;
    } catch (error) {
      this.logger.error(`Error while updating user`, error);
      throw error;
    }
  }

  private async setUserCache(userData: UserDocument) {
    try {
      await this.cacheManager.set(
        CACHE_CONSTANTS.USER.BY_EMAIL(userData.email),
        userData,
      );
      await this.cacheManager.set(
        CACHE_CONSTANTS.USER.BY_ID(userData.id),
        userData,
      );
    } catch (error) {
      this.logger.error(`Error while setting user cache`, error);
      throw error;
    }
  }

  private async deleteUserCache(userData: UserDocument) {
    try {
      await this.cacheManager.del(
        CACHE_CONSTANTS.USER.BY_EMAIL(userData.email),
      );
      await this.cacheManager.del(CACHE_CONSTANTS.USER.BY_ID(userData.id));
    } catch (error) {
      this.logger.error(`Error while deleting user cache`, error);
      throw error;
    }
  }
}
