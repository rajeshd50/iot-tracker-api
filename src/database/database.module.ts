import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { Role, RoleSchema } from './schemas/user/role.schema';
import { User, UserSchema } from './schemas/user/user.schema';
import {
  UserSession,
  UserSessionSchema,
} from './schemas/session/user.session.schema';
import { STRING_CONSTANTS } from 'src/constants';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Role.name, schema: RoleSchema },
        { name: User.name, schema: UserSchema },
        { name: UserSession.name, schema: UserSessionSchema },
      ],
      STRING_CONSTANTS.MAIN_DOC_DB_CONNECTION_NAME,
    ),
  ],
  providers: [DatabaseService],
  controllers: [DatabaseController],
})
export class DatabaseModule {}
