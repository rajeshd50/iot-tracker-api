import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DeviceFirmwareSyncStatus } from 'src/modules/database/schemas/device-firmware.schema';
import { User } from 'src/modules/database/schemas/user.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export class DeviceFirmwareEntity {
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

  version: string;
  filePath: string;
  fileUrl: string;
  syncStatus: DeviceFirmwareSyncStatus;
  isLatest: boolean;
  devicesSynced: number;

  syncAt?: Date;
  createdAt: Date;
  updatedAt?: Date;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  syncBy?: User;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  createdBy?: User;

  constructor(partial: Partial<DeviceFirmwareEntity>) {
    Object.assign(this, partial);
  }
}
