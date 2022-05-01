import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { CoreModule } from '../core/core.module';
import { UserTaskProcessor } from './processors/user.task.processor';

@Module({
  imports: [CoreModule, DatabaseModule],
  providers: [UserService, UserTaskProcessor],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
