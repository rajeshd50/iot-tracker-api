import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DevicePoolEntity } from './device-pool.entity';

class DevicePoolCollection extends Array<DevicePoolEntity> {}

export class DevicePoolListEntity {
  food: string;

  @Type(() => DevicePoolEntity)
  @Transform((param) =>
    param.value.map((dpEntity) => new DevicePoolEntity(dpEntity)),
  )
  items: DevicePoolCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<DevicePoolListEntity>) {
    Object.assign(this, partial);
  }
}
