import { SetMetadata } from '@nestjs/common';
import { APP_DECORATORS_KEYS } from 'src/config';

export const Public = () => SetMetadata(APP_DECORATORS_KEYS.IS_PUBLIC, true);
