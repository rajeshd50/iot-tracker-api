import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { User } from 'src/modules/database/schemas/user.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export class DeviceFirmwareSyncEntity {
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

  @Exclude()
  firmware: any;

  @Exclude()
  attachedDevices: any[];

  @Exclude()
  confirmedDevices: any[];

  syncJobId: string;
  completedAt?: Date | string;
  createdAt: Date;
  updatedAt?: Date;
  isAllDeviceSelected: boolean;
  confirmedCount: number;
  totalDeviceCount: number;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  syncBy?: User;

  constructor(partial: Partial<DeviceFirmwareSyncEntity>) {
    Object.assign(this, partial);
  }
}
