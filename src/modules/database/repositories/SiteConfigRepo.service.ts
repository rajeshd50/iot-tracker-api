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
      return this.siteConfigModel.findOne(query, projection, options);
    } catch (error) {
      this.logger.error(`Error while finding site config`, error);
      throw error;
    }
  }

  public async findByKey(
    key: string,
    projection: ProjectionType<SiteConfigDocument> = null,
    options: QueryOptions = {},
  ) {
    try {
      let siteConfigData: SiteConfigDocument = null;
      siteConfigData = await this.cacheManager.get(
        CACHE_CONSTANTS.SITE_CONFIG.BY_KEY(key.toLocaleLowerCase()),
      );
      if (!siteConfigData) {
        siteConfigData = await this.siteConfigModel.findOne(
          {
            key: key.toLocaleLowerCase(),
          },
          projection,
          options,
        );
        if (siteConfigData) {
          await this.cacheManager.set(
            CACHE_CONSTANTS.SITE_CONFIG.BY_KEY(key.toLocaleLowerCase()),
            siteConfigData.toObject(),
          );
        }
      }
      return siteConfigData;
    } catch (error) {
      this.logger.error(`Error while finding site config by key`, error);
      throw error;
    }
  }

  public async getValueByKey(key: string): Promise<any> {
    let value: any = null;
    try {
      const siteConfig = await this.findByKey(key);
      if (siteConfig && siteConfig.value) {
        value = siteConfig.value;
      }
    } catch (error) {
      this.logger.error(`Error while finding site config value by key`, error);
      throw error;
    }
    return value;
  }

  public async create(data: AnyKeys<SiteConfigDocument>) {
    try {
      const siteConfigCreated = await this.siteConfigModel.create(data);
      await this.setSiteConfigCache(siteConfigCreated);
      return siteConfigCreated;
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
      return this.siteConfigModel.find(query, projection, options);
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
        skip,
        limit,
      });
      return {
        total,
        page,
        perPage: limit,
        items: siteConfigs.map((dp) => dp.toObject()),
      };
    } catch (error) {
      this.logger.error(`Error while finding site config`, error);
      throw error;
    }
  }

  public async delete(query: FilterQuery<SiteConfigDocument>) {
    try {
      const siteConfigs = await this.siteConfigModel.find(query);
      await this.siteConfigModel.deleteMany(query);
      for (let i = 0; i < siteConfigs.length; i++) {
        await this.deleteSiteConfigCache(siteConfigs[i]);
      }
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
      const updatedSiteConfigData =
        await this.siteConfigModel.findByIdAndUpdate(
          id,
          {
            ...updateData,
          },
          {
            new: true,
          },
        );
      await this.setSiteConfigCache(updatedSiteConfigData);
      return updatedSiteConfigData;
    } catch (error) {
      this.logger.error(`Error while updating site config`, error);
      throw error;
    }
  }

  // special methods to fetch particular data
  public async findAdminMailingList() {
    try {
      const mailingListValue = await this.getValueByKey(
        SITE_CONFIG.ADMIN_MAILING_LIST,
      );
      const adminUsers = await this.userRepoService.findAll({
        role: ROLE.ADMIN,
      });
      const allEmails: string[] = [];
      const mailingListArr: string[] = mailingListValue
        ? mailingListValue
            .split(', ')
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

  private async setSiteConfigCache(siteConfigData: SiteConfigDocument) {
    try {
      await this.cacheManager.set(
        CACHE_CONSTANTS.SITE_CONFIG.BY_KEY(siteConfigData.key),
        siteConfigData,
      );
      await this.cacheManager.set(
        CACHE_CONSTANTS.SITE_CONFIG.BY_ID(siteConfigData._id),
        siteConfigData,
      );
    } catch (error) {
      this.logger.error(`Error while setting site config cache`, error);
      throw error;
    }
  }

  private async deleteSiteConfigCache(siteConfigData: SiteConfigDocument) {
    try {
      await this.cacheManager.del(
        CACHE_CONSTANTS.SITE_CONFIG.BY_KEY(siteConfigData.key),
      );
      await this.cacheManager.del(
        CACHE_CONSTANTS.SITE_CONFIG.BY_ID(siteConfigData._id),
      );
    } catch (error) {
      this.logger.error(`Error while deleting site config cache`, error);
      throw error;
    }
  }
}
