import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, AnyKeys, Types } from 'mongoose';
import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { ROLE } from 'src/config';
import { createPasswordHash } from '../auth/auth.util';

import { User, UserDocument } from '../database/schemas/user.schema';
import { UpdateUserDto } from './dto/user.update.dto';
import { UsersListResultEntity } from './entities/user-list.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findOne(
    filter: FilterQuery<UserDocument>,
  ): Promise<UserDocument | null> {
    try {
      return this.userModel.findOne(filter);
    } catch (error) {
      this.logger.error(`Error while finding user`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  public async create(
    userData: AnyKeys<UserDocument>,
  ): Promise<UserDocument | null> {
    try {
      const existingUserWithEmail = await this.userModel.findOne({
        email: userData.email,
      });
      if (existingUserWithEmail) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      const password = await createPasswordHash(userData.password);
      return this.userModel.create({
        ...userData,
        password,
      });
    } catch (error) {
      this.logger.error(`Error while finding user`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  public async getUserProfile(email: string): Promise<ApiResponse> {
    this.logger.log(`user email ${email}`);
    try {
      const user = await this.userModel.findOne({ email }, null, {
        lean: true,
      });
      return ApiSuccessResponse(new UserEntity(user), 'User profile');
    } catch (error) {
      this.logger.error(`Error while finding user profile`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  public async getAllUsers(user: UserEntity): Promise<ApiResponse> {
    try {
      const users = await this.userModel.find(
        {
          _id: {
            $ne: new Types.ObjectId(String(user._id)),
          },
          role: ROLE.USER,
        },
        null,
        {
          lean: true,
        },
      );
      return ApiSuccessResponse(
        new UsersListResultEntity({
          users: users.map((userItem) => new UserEntity(userItem)),
        }),
        'Users list',
      );
    } catch (error) {
      this.logger.error(`Error while finding users`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  public async updateUser(
    data: UpdateUserDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userEntity._id,
        {
          ...data,
        },
        {
          new: true,
        },
      );
      return ApiSuccessResponse(
        new UserEntity({
          ...user.toObject(),
        }),
        'User updated',
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(`Error while updating users`, error);
      throw new HttpException('Unable to update user', HttpStatus.NOT_MODIFIED);
    }
  }
}
