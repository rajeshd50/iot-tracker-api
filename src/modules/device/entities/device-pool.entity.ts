import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DevicePoolStatus } from 'src/config';

export class DevicePoolEntity {
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
  status: DevicePoolStatus;

  createdAt: Date;
  updatedAt?: Date;

  constructor(partial: Partial<DevicePoolEntity>) {
    Object.assign(this, partial);
  }
}
