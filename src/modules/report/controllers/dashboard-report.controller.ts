import { Body, Controller, Get, Post } from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { DashboardReportService } from '../services/dashboard-report.service';

@Controller('dashboard-report')
export class DashboardReportController {
  constructor(private dashboardReportService: DashboardReportService) {}

  @Roles(ROLE.ADMIN)
  @Post('device-count')
  async getDeviceCount() {
    return this.dashboardReportService.getDeviceCount();
  }

  @Roles(ROLE.ADMIN)
  @Post('user-count')
  async getUserCount() {
    return this.dashboardReportService.getUserCount();
  }
}
