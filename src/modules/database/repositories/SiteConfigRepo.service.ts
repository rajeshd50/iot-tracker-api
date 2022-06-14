import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  FilterQuery,
  AnyKeys,
  Types,
  ProjectionType,
  QueryOptions,
  LeanDocument,
} from 'mongoose';
import { Cache } from 'cache-manager';
import {
  CACHE_CONSTANTS,
  DEFAULT_PER_PAGE,
  ROLE,
  SITE_CONFIG,
  SITE_CONFIG_TYPES,
} from 'src/config';
import { SiteConfig, SiteConfigDocument } from '../schemas/site-config.schema';
import { UserRepoService } from './UserRepo.service';

@Injectable()
export class SiteConfigRepoService {
  private logger = new Logger(SiteConfigRepoService.name);
  constructor(
    @InjectModel(SiteConfig.name)
    private siteConfigModel: Model<SiteConfigDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private userRepoService: UserRepoService,
  ) {}

  public async findOne(
    query: FilterQuery<SiteConfigDocument>,
    projection: ProjectionType<SiteConfigDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      const siteConfig = await this.siteConfigModel.findOne(
        query,
        projection,
        options,
      );
      return siteConfig ? siteConfig.toObject() : null;
    } catch (error) {
      this.logger.error(`Error while finding site config`, error);
      throw error;
    }
  }

  public async findByKey(
    key: string,
    projection: ProjectionType<SiteConfigDocument> = null,
    options: QueryOptions = {},
    ignoreCache = false,
  ) {
    try {
      let siteConfigData: SiteConfigDocument = null;
      if (!ignoreCache) {
        siteConfigData = await this.cacheManager.get(
          CACHE_CONSTANTS.SITE_CONFIG.BY_KEY(key.toLocaleLowerCase()),
        );
      }
      if (siteConfigData) {
        return siteConfigData;
      }
      siteConfigData = await this.siteConfigModel.findOne(
        {
          key: key.toLocaleLowerCase(),
        },
        projection,
        options,
      );
      if (siteConfigData) {
        await this.setSiteConfigCache(siteConfigData.toObject());
      }
      return siteConfigData ? siteConfigData.toObject() : null;
    } catch (error) {
      this.logger.error(`Error while finding site config by key`, error);
      throw error;
    }
  }

  public async syncAvailableConfig() {
    try {
      const availableKeys = await this.getAvailableKeys(true);
      const availableInConfig = Object.assign({}, SITE_CONFIG);
      const toInsertData: AnyKeys<SiteConfigDocument>[] = [];
      const availableInConfigKeyArray = Object.keys(availableInConfig).map(
        (conf) => conf.toLocaleLowerCase(),
      );
      for (let i = 0; i < availableInConfigKeyArray.length; i++) {
        if (!availableKeys.includes(availableInConfigKeyArray[i])) {
          const key = availableInConfigKeyArray[i].toUpperCase();
          toInsertData.push({
            key: availableInConfigKeyArray[i],
            value: availableInConfig[key].defaultValue,
            type: availableInConfig[key].type,
            description: availableInConfig[key].description,
            isMultipleEntry: availableInConfig[key].isMultipleEntry || false,
          });
        }
      }
      for (let i = 0; i < toInsertData.length; i++) {
        await this.createOrUpdate(toInsertData[i]);
      }
      await this.getAvailableKeys(true);
    } catch (error) {
      this.logger.error(`Error while syncing available site configs`, error);
      throw error;
    }
  }

  public async getAvailableKeys(ignoreCache = false) {
    try {
      let allAvailableKeys: string[] = [];
      if (!ignoreCache) {
        allAvailableKeys = await this.cacheManager.get(
          CACHE_CONSTANTS.SITE_CONFIG.ALL_AVAILABLE_KEYS,
        );
      }
      if (!allAvailableKeys || !allAvailableKeys.length) {
        const allSiteConfigs = await this.siteConfigModel.find({});
        if (allSiteConfigs && allSiteConfigs.length) {
          allAvailableKeys = allSiteConfigs.map((sc) => sc.key);
          await this.cacheManager.set(
            CACHE_CONSTANTS.SITE_CONFIG.ALL_AVAILABLE_KEYS,
            allAvailableKeys,
          );
        }
      }
      return allAvailableKeys || [];
    } catch (error) {
      this.logger.error(`Error while finding all available keys`, error);
      throw error;
    }
  }

  private getValueByType(value: any, type: SITE_CONFIG_TYPES) {
    try {
      switch (type) {
        case SITE_CONFIG_TYPES.BOOLEAN:
          if (!value) {
            return false;
          }
          if (value === 'true') {
            return true;
          }
          if (value === 'false') {
            return false;
          }
          return !!value;
        case SITE_CONFIG_TYPES.TEXT:
          return value || '';
        case SITE_CONFIG_TYPES.NUMBER:
          return parseInt(String(value), 10);
        case SITE_CONFIG_TYPES.DATE:
        case SITE_CONFIG_TYPES.DATE_TIME:
          return value ? new Date(value) : null;
        default:
          return value || '';
      }
    } catch (error) {
      this.logger.error(
        `Error while converting site key value ${value} to ${type}`,
      );
      return null;
    }
  }

  public async getValueByKey<T>(
    key: string,
    defaultValue: T,
  ): Promise<T | null> {
    let value: T = defaultValue;
    try {
      value = await this.cacheManager.get(
        CACHE_CONSTANTS.SITE_CONFIG.VALUE_BY_KEY(key.toLocaleLowerCase()),
      );
      if (value !== undefined && value !== null) {
        return value;
      }
      const siteConfig = await this.findByKey(key);
      if (siteConfig && siteConfig.value !== undefined) {
        value = this.getValueByType(siteConfig.value, siteConfig.type) as T;
        await this.setSiteConfigCache(siteConfig);
      }
    } catch (error) {
      this.logger.error(`Error while finding site config value by key`, error);
      throw error;
    }
    return value;
  }

  public async createOrUpdate(data: AnyKeys<SiteConfigDocument>) {
    try {
      if (!data.key) {
        throw new Error('Key required');
      }
      const existingSiteConfig = await this.findByKey(data.key);
      if (existingSiteConfig) {
        return this.findByIdAndUpdate(existingSiteConfig._id, data);
      } else {
        const siteConfigCreated = await this.siteConfigModel.create(data);
        await this.setSiteConfigCache(siteConfigCreated.toObject());
        await this.getAvailableKeys(true);
        return siteConfigCreated.toObject();
      }
    } catch (error) {
      this.logger.error(`Error while creating site config`, error);
      throw error;
    }
  }

  public async findAll(
    query: FilterQuery<SiteConfigDocument>,
    projection: ProjectionType<SiteConfigDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      return this.siteConfigModel.find(query, projection, {
        ...options,
        lean: true,
      });
    } catch (error) {
      this.logger.error(`Error while finding site config`, error);
      throw error;
    }
  }

  public async paginate(
    query: FilterQuery<SiteConfigDocument>,
    projection: ProjectionType<SiteConfigDocument> = null,
    options: QueryOptions = {},
    page = 1,
    limit = DEFAULT_PER_PAGE,
  ) {
    try {
      const skip = (page - 1) * limit;
      const total = await this.siteConfigModel.countDocuments(query);
      const siteConfigs = await this.siteConfigModel.find(query, projection, {
        ...options,
        lean: true,
        skip,
        limit,
      });
      return {
        total,
        page,
        perPage: limit,
        items: siteConfigs,
      };
    } catch (error) {
      this.logger.error(`Error while finding site config`, error);
      throw error;
    }
  }

  public async delete(query: FilterQuery<SiteConfigDocument>) {
    try {
      const siteConfigs = await this.findAll(query);
      await this.siteConfigModel.deleteMany(query);
      for (let i = 0; i < siteConfigs.length; i++) {
        await this.deleteSiteConfigCache(siteConfigs[i]);
      }
      await this.getAvailableKeys(true);
    } catch (error) {
      this.logger.error(`Error while deleting site configs`, error);
      throw error;
    }
  }

  public async findByKeyAndUpdate(
    key: string,
    updateData: AnyKeys<SiteConfigDocument>,
  ) {
    try {
      const siteConfig = await this.findByKey(key);
      return this.findByIdAndUpdate(siteConfig._id, updateData);
    } catch (error) {
      this.logger.error(`Error while updating site config by key`, error);
      throw error;
    }
  }

  public async findByIdAndUpdate(
    id: string | object,
    updateData: AnyKeys<SiteConfigDocument>,
  ) {
    try {
      await this.siteConfigModel.findByIdAndUpdate(
        id,
        {
          ...updateData,
        },
        {
          new: true,
        },
      );
      const updatedSiteConfigData = await this.findOne({ _id: id });
      if (updatedSiteConfigData) {
        await this.setSiteConfigCache(updatedSiteConfigData);
      }
      return updatedSiteConfigData;
    } catch (error) {
      this.logger.error(`Error while updating site config`, error);
      throw error;
    }
  }

  // special methods to fetch particular data
  public async findAdminMailingList() {
    try {
      const mailingListValue = await this.getValueByKey<string>(
        SITE_CONFIG.ADMIN_MAILING_LIST.text,
        '',
      );
      const adminUsers = await this.userRepoService.findAll({
        role: ROLE.ADMIN,
      });
      const allEmails: string[] = [];
      const mailingListArr: string[] = mailingListValue
        ? mailingListValue
            .split(',')
            .map((x) => x.trim())
            .filter((x) => !!x)
        : [];
      const adminUsersEmails: string[] = adminUsers
        ? adminUsers.map((u) => u.email)
        : [];
      mailingListArr.forEach((m) => allEmails.push(m.trim()));
      adminUsersEmails.forEach((m) => allEmails.push(m.trim()));
      return allEmails;
    } catch (error) {
      this.logger.error(`Error while updating site config by key`, error);
      throw error;
    }
  }

  private async setSiteConfigCache(
    siteConfigData: LeanDocument<SiteConfigDocument>,
  ) {
    try {
      await this.cacheManager.set(
        CACHE_CONSTANTS.SITE_CONFIG.BY_KEY(siteConfigData.key),
        siteConfigData,
      );
      await this.cacheManager.set(
        CACHE_CONSTANTS.SITE_CONFIG.BY_ID(siteConfigData._id),
        siteConfigData,
      );
      await this.cacheManager.set(
        CACHE_CONSTANTS.SITE_CONFIG.VALUE_BY_KEY(siteConfigData.key),
        this.getValueByType(siteConfigData.value, siteConfigData.type) || '',
      );
    } catch (error) {
      this.logger.error(`Error while setting site config cache`, error);
      throw error;
    }
  }

  private async deleteSiteConfigCache(
    siteConfigData: LeanDocument<SiteConfigDocument>,
  ) {
    try {
      await this.cacheManager.del(
        CACHE_CONSTANTS.SITE_CONFIG.BY_KEY(siteConfigData.key),
      );
      await this.cacheManager.del(
        CACHE_CONSTANTS.SITE_CONFIG.BY_ID(siteConfigData._id),
      );
      await this.cacheManager.del(
        CACHE_CONSTANTS.SITE_CONFIG.VALUE_BY_KEY(siteConfigData.key),
      );
    } catch (error) {
      this.logger.error(`Error while deleting site config cache`, error);
      throw error;
    }
  }
}
