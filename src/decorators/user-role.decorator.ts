import { SetMetadata } from '@nestjs/common';
import { APP_DECORATORS_KEYS, ROLE } from 'src/config';

export const Roles = (...roles: ROLE[]) =>
  SetMetadata(APP_DECORATORS_KEYS.ROLES, roles);
