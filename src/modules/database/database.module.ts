import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { STRING_CONSTANTS } from 'src/config';
import { User, UserSchema } from './schemas/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      STRING_CONSTANTS.MAIN_DOC_DB_CONNECTION_NAME,
    ),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
