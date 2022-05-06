import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CoreModule } from '../core/core.module';
import { DashboardReportService } from './services/dashboard-report.service';
import { DashboardReportController } from './controllers/dashboard-report.controller';

@Module({
  imports: [CoreModule, DatabaseModule],
  providers: [DashboardReportService],
  controllers: [DashboardReportController],
  exports: [DashboardReportService],
})
export class ReportModule {}
