import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DeviceAssignStatus, DeviceLiveStatus, DeviceStatus } from 'src/config';
import { User } from 'src/modules/database/schemas/user.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export class DeviceEntity {
  @Expose()
  public get id() {
    return this._id && typeof this._id === 'object'
      ? (this._id as any).toHexString()
      : this._id;
  }
  @Exclude()
  _id: object;

  @Exclude()
  __v: number;

  serial: string;
  liveStatus: DeviceLiveStatus;
  assignStatus: DeviceAssignStatus;
  status: DeviceStatus;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  user: User;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  approvedBy: User;

  name?: string;
  vehicleName?: string;
  vehicleNumber?: string;

  approvedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
  approvalRequestedAt?: Date;
  lastSeenAt?: Date;
  driverName?: string;
  driverContact?: string;
  driverOtherDetails?: string;

  constructor(partial: Partial<DeviceEntity>) {
    Object.assign(this, partial);
  }
}
