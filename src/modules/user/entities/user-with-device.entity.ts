import { UserEntity } from './user.entity';

export class UserWithDeviceEntity extends UserEntity {
  totalDevice: number;
  activeDevice: number;
  inactiveDevice: number;
  pendingDevice: number;

  constructor(data: Partial<UserEntity>) {
    super(data);
    Object.assign(this, data);
  }
}
