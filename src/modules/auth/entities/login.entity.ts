import { Exclude, Transform, Type } from 'class-transformer';
import { User } from 'src/modules/database/schemas/user.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export class LoginEntity {
  accessToken: string;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  user: User;

  constructor(partial: Partial<LoginEntity>) {
    Object.assign(this, partial);
  }
}
