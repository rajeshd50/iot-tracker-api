import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { SiteConfigCreateUpdateDto } from '../dto/site-config-create-update.dto';
import { SiteConfigDetailsDto } from '../dto/site-config-details.dto';
import { FetchSiteConfigDto } from '../dto/site-config-fetch.dto';
import { SiteConfigService } from '../services/site-config.service';

@Controller('site-config')
export class SiteConfigController {
  constructor(private siteConfigService: SiteConfigService) {}

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('update')
  async updateConfig(@Body() data: SiteConfigCreateUpdateDto) {
    return this.siteConfigService.updateConfig(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('fetch')
  async fetch(@Body() data: FetchSiteConfigDto) {
    return this.siteConfigService.fetch(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('details')
  async fetchDetails(@Body() data: SiteConfigDetailsDto) {
    return this.siteConfigService.fetchDetails(data);
  }
}
