import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { FilterQuery, AnyKeys } from 'mongoose';
import { OrderByDirection } from 'src/common/api.common.interfaces';

import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { DeviceAssignStatus, DeviceStatus } from 'src/config';
import { DevicePoolRepoService } from 'src/modules/database/repositories/DevicePoolRepo.service';
import { DeviceRepoService } from 'src/modules/database/repositories/DeviceRepo.service';
import { DeviceDocument } from 'src/modules/database/schemas/device.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DeleteDeviceDto } from '../dto/delete-device.dto';
import { DeviceRequestAssignmentDto } from '../dto/device-assign-request.dto';
import { DeviceDetailsDto } from '../dto/device-details.dto';
import { DeviceUpdateDto } from '../dto/device-update.dto';
import { FetchDeviceDto } from '../dto/fetch-device.dto';
import { UpdateAssignmentApprovalDto } from '../dto/update-assignment-approval.dto';
import { UpdateDeviceStatusDto } from '../dto/update-device-status.dto';
import { DeviceEntity } from '../entities/device.entity';
import { DeviceListEntity } from '../entities/device.list.entity';

@Injectable()
export class DeviceService {
  private logger = new Logger(DeviceService.name);

  constructor(
    @Inject(forwardRef(() => DeviceRepoService))
    private deviceRepoService: DeviceRepoService,
    @Inject(forwardRef(() => DevicePoolRepoService))
    private devicePoolRepoService: DevicePoolRepoService,
  ) {}

  public async requestAssignment(
    data: DeviceRequestAssignmentDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const device = await this.deviceRepoService.findBySerial(data.serial);
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.NOT_FOUND);
      }
      if (device.user && String(device.user._id) !== userEntity.id) {
        throw new HttpException('Invalid device', HttpStatus.BAD_REQUEST);
      }
      if (device.assignStatus === DeviceAssignStatus.ASSIGNED) {
        throw new HttpException(
          'Device already assigned',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (device.assignStatus === DeviceAssignStatus.PENDING_APPROVAL) {
        throw new HttpException(
          'Request already created',
          HttpStatus.BAD_REQUEST,
        );
      }
      // todo send email to admin new request received
      await this.deviceRepoService.findByIdAndUpdate(device._id, {
        assignStatus: DeviceAssignStatus.PENDING_APPROVAL,
        user: userEntity.id,
        name: data.name || null,
        vehicleName: data.vehicleName || null,
        vehicleNumber: data.vehicleNumber || null,
        approvalRequestedAt: new Date(),
      });
      const updatedDevice = await this.deviceRepoService.findBySerial(
        data.serial,
        null,
        {
          populate: {
            path: 'user',
          },
        },
      );
      return ApiSuccessResponse(
        new DeviceEntity(updatedDevice),
        'Request submitted',
      );
    } catch (error) {
      this.logger.error(`Unable to add request for device assignment`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to add request for device assignment',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async fetchDevice(
    filter: FetchDeviceDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const query: FilterQuery<DeviceDocument> = {};

      if (!userEntity.isAdmin) {
        query.user = userEntity.id;
      } else if (filter.user) {
        query.user = filter.user;
      }
      if (filter.assignStatus) {
        query.assignStatus = filter.assignStatus;
      }
      if (filter.liveStatus) {
        query.liveStatus = filter.liveStatus;
      }
      if (filter.status) {
        query.status = filter.status;
      }
      if (filter.serial) {
        query.serial = filter.serial.toLocaleUpperCase();
      }
      if (filter.searchText) {
        query.$or = [
          { name: new RegExp(filter.searchText, 'i') },
          { vehicleName: new RegExp(filter.searchText, 'i') },
          { vehicleNumber: new RegExp(filter.searchText, 'i') },
          { driverName: new RegExp(filter.searchText, 'i') },
          { driverContact: new RegExp(filter.searchText, 'i') },
          { driverOtherDetails: new RegExp(filter.searchText, 'i') },
          { serial: new RegExp(filter.searchText, 'i') },
        ];
      }

      let defaultOrder = '-createdAt';
      if (filter.orderBy && filter.orderByDirection) {
        defaultOrder = `${
          filter.orderByDirection === OrderByDirection.DESCENDING ? '-' : ''
        }${filter.orderBy}`;
      }

      const paginatedDevices = await this.deviceRepoService.paginate(
        query,
        null,
        { sort: defaultOrder },
        filter.page,
        filter.perPage,
      );
      return ApiSuccessResponse(
        new DeviceListEntity({
          ...paginatedDevices,
          items: paginatedDevices.items.map((d) => new DeviceEntity(d)),
        }),
        'Device list',
      );
    } catch (error) {
      this.logger.error(`Unable to fetch devices`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to fetch devices',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async updateApprovalForAssignment(
    data: UpdateAssignmentApprovalDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const device = await this.deviceRepoService.findBySerial(data.serial);
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.NOT_FOUND);
      }
      if (device.assignStatus !== DeviceAssignStatus.PENDING_APPROVAL) {
        throw new HttpException(
          'Approval status already updated',
          HttpStatus.BAD_REQUEST,
        );
      }
      // todo send email to user request approve/rejected
      const updateObj: AnyKeys<DeviceDocument> = {};
      if (data.isApproved) {
        updateObj.assignStatus = DeviceAssignStatus.ASSIGNED;
        updateObj.approvedBy = userEntity.id;
        updateObj.approvedAt = new Date();
        updateObj.status = DeviceStatus.ACTIVE;
      } else {
        updateObj.assignStatus = DeviceAssignStatus.NOT_ASSIGNED;
        updateObj.status = DeviceStatus.INACTIVE;
        updateObj.approvalRequestedAt = null;
        updateObj.user = null;
        updateObj.name = null;
        updateObj.vehicleName = null;
        updateObj.vehicleNumber = null;
      }
      await this.deviceRepoService.findByIdAndUpdate(device._id, updateObj);
      const updatedDevice = await this.deviceRepoService.findById(device._id);
      return ApiSuccessResponse(
        new DeviceEntity(updatedDevice),
        `Assignment ${data.isApproved ? 'approved' : 'rejected'}`,
      );
    } catch (error) {
      this.logger.error(
        `Unable to update device assignment approval status`,
        error,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update device assignment approval status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async updateDeviceStatus(
    data: UpdateDeviceStatusDto,
  ): Promise<ApiResponse> {
    try {
      const device = await this.deviceRepoService.findBySerial(data.serial);
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.NOT_FOUND);
      }
      if (device.assignStatus !== DeviceAssignStatus.ASSIGNED) {
        throw new HttpException(
          'Device not assigned to any user',
          HttpStatus.BAD_REQUEST,
        );
      }
      const updateObj: AnyKeys<DeviceDocument> = {
        status: data.status,
      };
      await this.deviceRepoService.findByIdAndUpdate(device._id, updateObj);
      const updatedDevice = await this.deviceRepoService.findById(device._id);
      return ApiSuccessResponse(
        new DeviceEntity(updatedDevice.toObject()),
        `Device marked as ${
          data.status === DeviceStatus.ACTIVE ? 'active' : 'inactive'
        }`,
      );
    } catch (error) {
      this.logger.error(`Unable to update device status`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update device status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async updateDevice(
    data: DeviceUpdateDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const device = await this.deviceRepoService.findBySerial(data.id);
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.NOT_FOUND);
      }
      if (device.assignStatus !== DeviceAssignStatus.ASSIGNED) {
        throw new HttpException('Invalid device', HttpStatus.BAD_REQUEST);
      }
      if (!device.user || String(device.user._id) !== String(userEntity._id)) {
        throw new HttpException('Invalid device', HttpStatus.BAD_REQUEST);
      }
      const updateObj: AnyKeys<DeviceDocument> = {};
      if (data.name) {
        updateObj.name = data.name;
      }
      if (data.vehicleName) {
        updateObj.vehicleName = data.vehicleName;
      }
      if (data.vehicleNumber) {
        updateObj.vehicleNumber = data.vehicleNumber;
      }
      if (data.driverName) {
        updateObj.driverName = data.driverName;
      }
      if (data.driverContact) {
        updateObj.driverContact = data.driverContact;
      }
      if (data.driverOtherDetails) {
        updateObj.driverOtherDetails = data.driverOtherDetails;
      }
      await this.deviceRepoService.findByIdAndUpdate(device._id, updateObj);
      const updatedDevice = await this.deviceRepoService.findById(device._id);
      return ApiSuccessResponse(
        new DeviceEntity(updatedDevice.toObject()),
        'Device updated',
      );
    } catch (error) {
      this.logger.error(`Unable to update device`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update device',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async details(
    data: DeviceDetailsDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const device = data.serial
        ? await this.deviceRepoService.findBySerial(data.serial)
        : await this.deviceRepoService.findById(data.id);
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.NOT_FOUND);
      }
      if (device.user && String(device.user._id) !== userEntity.id) {
        throw new HttpException('Invalid device', HttpStatus.BAD_REQUEST);
      }
      return ApiSuccessResponse(new DeviceEntity(device), 'Device details');
    } catch (error) {
      this.logger.error(`Unable to find device details`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to find device details',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async delete({ serial, id }: DeleteDeviceDto): Promise<ApiResponse> {
    try {
      const devicePoolObj = serial
        ? await this.devicePoolRepoService.findBySerial(serial)
        : await this.devicePoolRepoService.findOne({ _id: id });
      if (!devicePoolObj) {
        throw new HttpException('Invalid request', HttpStatus.NOT_FOUND);
      }
      const deviceObj = await this.deviceRepoService.findBySerial(
        devicePoolObj.serial,
      );
      if (!deviceObj) {
        throw new HttpException('Invalid request', HttpStatus.NOT_FOUND);
      }
      if (deviceObj.assignStatus !== DeviceAssignStatus.NOT_ASSIGNED) {
        throw new HttpException(
          'Invalid request, device already assigned/pending request',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.devicePoolRepoService.delete({ _id: devicePoolObj._id });
      await this.deviceRepoService.delete({ _id: deviceObj._id });
      return ApiSuccessResponse({}, 'Device deleted', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Unable to delete device`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Unable to delete device', HttpStatus.NOT_FOUND);
    }
  }
}
