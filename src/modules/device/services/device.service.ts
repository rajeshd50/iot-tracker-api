import { InjectQueue } from '@nestjs/bull';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Queue } from 'bull';

import { FilterQuery, AnyKeys } from 'mongoose';
import { OrderByDirection } from 'src/common/api.common.interfaces';

import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import {
  DeviceAssignStatus,
  DeviceStatus,
  QUEUE_CONSTANTS,
  UNLIMITED_NUMBER,
} from 'src/config';
import { DevicePoolRepoService } from 'src/modules/database/repositories/DevicePoolRepo.service';
import { DeviceRepoService } from 'src/modules/database/repositories/DeviceRepo.service';
import { GeoFenceRepoService } from 'src/modules/database/repositories/GeoFenceRepo.service';
import { UserLimitRepoService } from 'src/modules/database/repositories/UserLimitRepo.service';
import { DeviceDocument } from 'src/modules/database/schemas/device.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AssignDeviceDto } from '../dto/assign-device.dto';
import { DeleteDeviceDto } from '../dto/delete-device.dto';
import { DeviceRequestAssignmentDto } from '../dto/device-assign-request.dto';
import { DeviceDetailsDto } from '../dto/device-details.dto';
import { DeviceUpdateDto } from '../dto/device-update.dto';
import { FetchDeviceDto } from '../dto/fetch-device.dto';
import { UpdateAssignmentApprovalDto } from '../dto/update-assignment-approval.dto';
import { UpdateDeviceLimitDto } from '../dto/update-device-limit.dto';
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
    @Inject(forwardRef(() => GeoFenceRepoService))
    private geoFenceRepoService: GeoFenceRepoService,
    @Inject(forwardRef(() => UserLimitRepoService))
    private userLimitRepoService: UserLimitRepoService,
    @InjectQueue(QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.NAME)
    private deviceJobQueue: Queue,
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
      const remainingLimitForDeviceAdd =
        await this.userLimitRepoService.getRemainingDeviceLimitForUser(
          userEntity.id,
        );
      if (
        remainingLimitForDeviceAdd !== UNLIMITED_NUMBER &&
        remainingLimitForDeviceAdd === 0
      ) {
        throw new HttpException(
          'Limit to add device reached, please contact support for further help!',
          HttpStatus.BAD_REQUEST,
        );
      }
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
        {},
      );
      await this.deviceJobQueue.add(
        QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.APPROVAL_REQUEST_EMAIL,
        {
          deviceData: new DeviceEntity(updatedDevice),
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
      if (filter.withGeoFence) {
        query.attachedGeoFences = {
          $in: [filter.withGeoFence],
        };
      }
      if (filter.withoutGeoFence) {
        if (!query.attachedGeoFences) {
          query.attachedGeoFences = {};
        }
        query.attachedGeoFences.$nin = [filter.withoutGeoFence];
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

      if (data.isApproved) {
        await this.deviceJobQueue.add(
          QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.APPROVAL_ACCEPTED_EMAIL,
          {
            deviceData: new DeviceEntity(updatedDevice),
          },
        );
      } else {
        await this.deviceJobQueue.add(
          QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.APPROVAL_REJECTED_EMAIL,
          {
            deviceData: new DeviceEntity(updatedDevice),
            userData: new UserEntity(device.user),
          },
        );
      }

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
        new DeviceEntity(updatedDevice),
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
      const device = await this.deviceRepoService.findById(data.id);
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
        new DeviceEntity(updatedDevice),
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

      await this.geoFenceRepoService.pullDeviceSerialId(deviceObj.serial);

      return ApiSuccessResponse({}, 'Device deleted', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Unable to delete device`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Unable to delete device', HttpStatus.NOT_FOUND);
    }
  }

  public async assignDevice(
    data: AssignDeviceDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const device = await this.deviceRepoService.findById(data.deviceId);
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.NOT_FOUND);
      }
      if (device.assignStatus === DeviceAssignStatus.ASSIGNED) {
        throw new HttpException(
          'Approval already assigned to a user',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (device.assignStatus === DeviceAssignStatus.PENDING_APPROVAL) {
        throw new HttpException(
          'Some user already applied for approval for this device',
          HttpStatus.BAD_REQUEST,
        );
      }
      const updateObj: AnyKeys<DeviceDocument> = {};
      updateObj.assignStatus = DeviceAssignStatus.ASSIGNED;
      updateObj.approvedBy = userEntity.id;
      updateObj.approvedAt = new Date();
      updateObj.status = DeviceStatus.ACTIVE;
      updateObj.approvalRequestedAt = new Date();
      updateObj.user = data.userId;

      await this.deviceRepoService.findByIdAndUpdate(device._id, updateObj);
      const updatedDevice = await this.deviceRepoService.findById(device._id);

      await this.deviceJobQueue.add(
        QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.DEVICE_ADDED_TO_ACCOUNT,
        {
          deviceData: new DeviceEntity(updatedDevice),
        },
      );

      return ApiSuccessResponse(
        new DeviceEntity(updatedDevice),
        `Device assigned to user`,
      );
    } catch (error) {
      this.logger.error(`Unable to assign device to user`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to assign device to user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async updateDeviceLimit(
    data: UpdateDeviceLimitDto,
  ): Promise<ApiResponse> {
    try {
      const device = await this.deviceRepoService.findBySerial(data.serial);
      if (!device) {
        throw new HttpException('Invalid device', HttpStatus.NOT_FOUND);
      }
      const updateObj: AnyKeys<DeviceDocument> = {
        maxFence: data.maxFence,
      };
      await this.deviceRepoService.findByIdAndUpdate(device._id, updateObj);
      const updatedDevice = await this.deviceRepoService.findById(device._id);
      return ApiSuccessResponse(
        new DeviceEntity(updatedDevice),
        'Device limit updated',
      );
    } catch (error) {
      this.logger.error(`Unable to update device limit`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Unable to update device limit',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
