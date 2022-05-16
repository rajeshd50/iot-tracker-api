import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  FilterQuery,
  AnyKeys,
  Types,
  ProjectionType,
  QueryOptions,
} from 'mongoose';
import { DeviceAssignStatus, DeviceStatus, ROLE } from 'src/config';
import { DevicePool, DevicePoolDocument } from '../schemas/device-pool.schema';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class DashboardReportRepoService {
  private logger = new Logger(DashboardReportRepoService.name);
  constructor(
    @InjectModel(DevicePool.name)
    private devicePoolModel: Model<DevicePoolDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Device.name)
    private deviceModel: Model<DeviceDocument>,
  ) {}

  public async getDeviceCount() {
    try {
      const result = await this.deviceModel.aggregate([
        {
          $group: {
            _id: null,
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
            _id: 0,
            total: 1,
            purchased: 1,
            active: 1,
          },
        },
      ]);
      return result && result.length
        ? result[0]
        : { total: 0, purchased: 0, active: 0 };
    } catch (error) {
      this.logger.error(`Error while fetching devices count`, error);
      throw error;
    }
  }

  public async getUserCount() {
    try {
      const result = await this.userModel.aggregate([
        {
          $match: {
            role: ROLE.USER,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: 1,
            },
            active: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            active: 1,
          },
        },
      ]);
      return result && result.length ? result[0] : { total: 0, active: 0 };
    } catch (error) {
      this.logger.error(`Error while fetching users count`, error);
      throw error;
    }
  }
}
