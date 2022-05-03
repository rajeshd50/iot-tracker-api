import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DeviceEntity } from './device.entity';

class DeviceCollection extends Array<DeviceEntity> {}

export class DeviceListEntity {
  food: string;

  @Type(() => DeviceEntity)
  @Transform((param) =>
    param.value.map((dpEntity) => new DeviceEntity(dpEntity)),
  )
  items: DeviceCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<DeviceListEntity>) {
    Object.assign(this, partial);
  }
}
