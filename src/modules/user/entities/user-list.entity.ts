import { Transform, Type } from 'class-transformer';
import { UserEntity } from './user.entity';

class UsersListCollection extends Array<UserEntity> {}

export class UsersListResultEntity {
  @Type(() => UserEntity)
  @Transform((param) => param.value.map((dpEntity) => new UserEntity(dpEntity)))
  items: UsersListCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<UsersListResultEntity>) {
    Object.assign(this, partial);
  }
}
