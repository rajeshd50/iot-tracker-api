import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { DashboardReportRepoService } from 'src/modules/database/repositories/DashboardReportRepo.service';
import { DashboardDeviceCountEntity } from '../entities/dashboard-device-count.entity';
import { DashboardUserCountEntity } from '../entities/dashboard-user-count.entity';

@Injectable()
export class DashboardReportService {
  private logger = new Logger(DashboardReportService.name);
  constructor(
    @Inject(forwardRef(() => DashboardReportRepoService))
    private dashboardReportRepoService: DashboardReportRepoService,
  ) {}

  public async getDeviceCount(): Promise<ApiResponse> {
    try {
      const result = await this.dashboardReportRepoService.getDeviceCount();
      return ApiSuccessResponse(
        new DashboardDeviceCountEntity(result),
        'Device count',
      );
    } catch (error) {
      this.logger.error(`Error while fetching device count`, error);
      throw new HttpException(
        'Unable to fetch device count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getUserCount(): Promise<ApiResponse> {
    try {
      const result = await this.dashboardReportRepoService.getUserCount();
      return ApiSuccessResponse(
        new DashboardUserCountEntity(result),
        'User count',
      );
    } catch (error) {
      this.logger.error(`Error while fetching user count`, error);
      throw new HttpException(
        'Unable to fetch user count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
