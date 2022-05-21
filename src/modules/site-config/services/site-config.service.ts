import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { SiteConfigRepoService } from 'src/modules/database/repositories/SiteConfigRepo.service';
import { SiteConfigDocument } from 'src/modules/database/schemas/site-config.schema';
import { SiteConfigCreateUpdateDto } from '../dto/site-config-create-update.dto';
import { SiteConfigDetailsDto } from '../dto/site-config-details.dto';
import { FetchSiteConfigDto } from '../dto/site-config-fetch.dto';
import { SiteConfigEntity } from '../entities/site-config.entity';
import { SiteConfigListEntity } from '../entities/site-config.list.entity';

@Injectable()
export class SiteConfigService implements OnApplicationBootstrap {
  private logger = new Logger(SiteConfigService.name);

  constructor(
    @Inject(forwardRef(() => SiteConfigRepoService))
    private siteConfigRepoService: SiteConfigRepoService,
  ) {}

  onApplicationBootstrap() {
    try {
      this.logger.log('In app bootstrap, site config sync');
      this.siteConfigRepoService.syncAvailableConfig().then((_) => {
        this.logger.log('Site config sync done');
      });
    } catch (error) {
      this.logger.error(`Error while syncing site configs`, error);
    }
  }

  public async updateConfig(
    data: SiteConfigCreateUpdateDto,
  ): Promise<ApiResponse> {
    try {
      const siteConfigObj = await this.siteConfigRepoService.createOrUpdate({
        ...data,
        key: data.key.toLowerCase(),
      });
      return ApiSuccessResponse(
        new SiteConfigEntity(siteConfigObj),
        'Site config updated',
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(`Unable to update site config`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update site config',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async fetch(filter: FetchSiteConfigDto): Promise<ApiResponse> {
    try {
      const query: FilterQuery<SiteConfigDocument> = {};
      if (filter.searchText) {
        query.$or = [
          { key: new RegExp(filter.searchText, 'i') },
          { value: new RegExp(filter.searchText, 'i') },
          { description: new RegExp(filter.searchText, 'i') },
        ];
      }
      const paginatedResponse = await this.siteConfigRepoService.paginate(
        query,
        null,
        { sort: 'key' },
        filter.page,
        filter.perPage,
      );
      return ApiSuccessResponse(
        new SiteConfigListEntity({
          ...paginatedResponse,
          items: paginatedResponse.items.map((dp) => new SiteConfigEntity(dp)),
        }),
        'All site configs',
      );
    } catch (error) {
      this.logger.error(`Unable to fetch site configs`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch site configs',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async fetchDetails({
    key,
  }: SiteConfigDetailsDto): Promise<ApiResponse> {
    try {
      const siteConfigObj = await this.siteConfigRepoService.findByKey(key);
      if (!siteConfigObj) {
        throw new HttpException('Invalid request', HttpStatus.NOT_FOUND);
      }
      return ApiSuccessResponse(
        new SiteConfigEntity(siteConfigObj),
        'Site config details',
        HttpStatus.OK,
      );
    } catch (error) {
      this.logger.error(`Unable to fetch site config details`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch site config details',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
