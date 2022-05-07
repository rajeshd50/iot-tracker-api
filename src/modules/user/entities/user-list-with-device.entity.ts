import { Transform, Type } from 'class-transformer';
import { UserWithDeviceEntity } from './user-with-device.entity';

class UsersWithListCollection extends Array<UserWithDeviceEntity> {}

export class UsersWithDeviceListResultEntity {
  @Type(() => UserWithDeviceEntity)
  @Transform((param) =>
    param.value.map((dpEntity) => new UserWithDeviceEntity(dpEntity)),
  )
  items: UsersWithListCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<UsersWithDeviceListResultEntity>) {
    Object.assign(this, partial);
  }
}
