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
import { CACHE_CONSTANTS } from 'src/config';

@Injectable()
export class UserRepoService {
  private logger = new Logger(UserRepoService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
  ) {
    try {
      let userData: UserDocument = null;
      userData = await this.cacheManager.get(
        CACHE_CONSTANTS.USER.BY_EMAIL(email),
      );
      if (!userData) {
        this.logger.log('Returning from db');
        userData = await this.userModel.findOne(
          {
            email,
          },
          projection,
          options,
        );
        if (userData) {
          await this.cacheManager.set(
            CACHE_CONSTANTS.USER.BY_EMAIL(email),
            userData,
          );
        }
      } else {
        this.logger.log('Returning from cache');
      }
      return userData;
    } catch (error) {
      this.logger.error(`Error while finding user`, error);
      throw error;
    }
  }

  public async create(data: AnyKeys<UserDocument>) {
    try {
      const userCreated = await this.userModel.create(data);
      await this.setUserCache(userCreated);
      return userCreated;
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
      this.logger.error(`Error while creating user`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<UserDocument>,
  ) {
    try {
      const updatedUserData = await this.userModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
        },
      );
      await this.setUserCache(updatedUserData);
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
