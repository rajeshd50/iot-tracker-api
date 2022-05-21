import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { DatabaseModule } from '../database/database.module';
import { SiteConfigController } from './controllers/site-config.controller';
import { SiteConfigService } from './services/site-config.service';

@Module({
  imports: [CoreModule, DatabaseModule],
  providers: [SiteConfigService],
  controllers: [SiteConfigController],
})
export class SiteConfigModule {}
