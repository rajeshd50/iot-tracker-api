import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ADMIN_USER_SEED,
  DEFAULT_USER_SEED,
  ENV_CONSTANTS,
  ROLE_TYPES,
} from 'src/constants';
import { Role, RoleDocument } from './schemas/user/role.schema';

import { User, UserDocument } from './schemas/user/user.schema';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private configService: ConfigService,
  ) {
    this.logger.log(
      `DB URL ==> ${configService.get(ENV_CONSTANTS.DOC_DB_URI)}`,
    );
  }

  async checkDb() {
    try {
      const user = await this.userModel.findOne({
        userName: 'admin',
      });
      this.logger.log(`is user admin ==> ${await user.isAdmin()}`);
      return {
        ...user.toJSON(),
        isAdmin: await user.isAdmin(),
      };
    } catch (e) {
      this.logger.error(e);
    }
  }

  async seedDb() {
    try {
      const roles = await this.roleModel.find();
      if (!roles.length) {
        await this.roleModel.insertMany([
          new this.roleModel({
            type: ROLE_TYPES.ADMIN,
          }),
          new this.roleModel({
            type: ROLE_TYPES.USER,
          }),
        ]);
      }
      const users = await this.userModel.find();
      if (!users.length) {
        const adminRole = await this.roleModel.findOne({
          type: ROLE_TYPES.ADMIN,
        });
        const userRole = await this.roleModel.findOne({
          type: ROLE_TYPES.USER,
        });
        await this.userModel.insertMany([
          new this.userModel({
            userName: ADMIN_USER_SEED.userName,
            password: ADMIN_USER_SEED.password,
            role: adminRole.id,
          }),
          new this.userModel({
            userName: DEFAULT_USER_SEED.userName,
            password: DEFAULT_USER_SEED.password,
            role: userRole.id,
          }),
        ]);
      }
      return { status: HttpStatus.OK };
    } catch (e) {
      this.logger.error(e);
    }
  }
}
