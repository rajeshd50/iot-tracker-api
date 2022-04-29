import { Type } from 'class-transformer';
import { UserEntity } from './user.entity';

class UsersListCollection extends Array<UserEntity> {}

export class UsersListResultEntity {
  @Type(() => UserEntity)
  users: UsersListCollection;

  constructor(partial: Partial<UsersListResultEntity>) {
    Object.assign(this, partial);
  }
}
