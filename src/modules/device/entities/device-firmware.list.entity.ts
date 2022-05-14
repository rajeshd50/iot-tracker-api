import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DeviceFirmwareEntity } from './device-firmware.entity';

class DeviceFirmwareCollection extends Array<DeviceFirmwareEntity> {}

export class DeviceFirmwareListEntity {
  food: string;

  @Type(() => DeviceFirmwareEntity)
  @Transform((param) =>
    param.value.map((dpEntity) => new DeviceFirmwareEntity(dpEntity)),
  )
  items: DeviceFirmwareCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<DeviceFirmwareListEntity>) {
    Object.assign(this, partial);
  }
}
