import { InjectQueue } from '@nestjs/bull';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { add, isBefore } from 'date-fns';
import { Queue } from 'bull';
import { FilterQuery, AnyKeys, Types } from 'mongoose';
import { ApiResponse, ApiSuccessResponse } from 'src/common/app.response';
import { QUEUE_CONSTANTS, ROLE } from 'src/config';
import { createPasswordHash } from '../auth/auth.util';
import { UserRepoService } from '../database/repositories/UserRepo.service';

import { UserDocument } from '../database/schemas/user.schema';
import { UpdateUserDto } from './dto/user.update.dto';
import { UsersListResultEntity } from './entities/user-list.entity';
import { UserEntity } from './entities/user.entity';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    @Inject(forwardRef(() => UserRepoService))
    private userRepoService: UserRepoService,
    @InjectQueue(QUEUE_CONSTANTS.USER_SERVICE_QUEUE.NAME)
    private userJobQueue: Queue,
  ) {}

  public async findOne(
    filter: FilterQuery<UserDocument>,
  ): Promise<UserDocument | null> {
    try {
      return this.userRepoService.findOne(filter);
    } catch (error) {
      this.logger.error(`Error while finding user`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  public async create(
    userData: AnyKeys<UserDocument>,
  ): Promise<UserDocument | null> {
    try {
      const existingUserWithEmail = await this.userRepoService.findByEmail(
        userData.email,
      );
      if (existingUserWithEmail) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      const password = await createPasswordHash(userData.password);
      return this.userRepoService.create({
        ...userData,
        password,
        role: ROLE.USER,
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
    try {
      const user = await this.userRepoService.findByEmail(email, null, {
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
      const users = await this.userRepoService.findAll(
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
      const user = await this.userRepoService.findByIdAndUpdate(
        userEntity._id,
        {
          ...data,
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

  public async initiateResetPassword(email: string): Promise<ApiResponse> {
    try {
      const user = await this.userRepoService.findByEmail(email, null, {
        lean: true,
      });
      const resetPasswordToken = await createPasswordHash(
        `${user.email}_${new Date().getTime()}`,
      );
      const resetPasswordExpiresAt = add(new Date(), {
        days: 1,
      });
      const userUpdated = await this.userRepoService.findByIdAndUpdate(
        user._id,
        {
          resetPasswordToken,
          resetPasswordExpiresAt,
        },
      );
      await this.userJobQueue.add(
        QUEUE_CONSTANTS.USER_SERVICE_QUEUE.TASKS.SEND_PASSWORD_RESET_EMAIL,
        {
          userData: userUpdated.toObject(),
        },
      );
      return ApiSuccessResponse(
        new UserEntity(userUpdated),
        'Initiated user reset password',
      );
    } catch (error) {
      this.logger.error(`Error while finding user profile`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  public async resetPassword(data: ResetPasswordDto): Promise<ApiResponse> {
    try {
      const user = await this.userRepoService.findOne({
        resetPasswordToken: data.resetPasswordToken,
      });
      if (isBefore(user.resetPasswordExpiresAt, new Date())) {
        throw new HttpException('Link expired', HttpStatus.NOT_FOUND);
      }
      const password = await createPasswordHash(data.password);
      const userUpdated = await this.userRepoService.findByIdAndUpdate(
        user._id,
        {
          resetPasswordToken: null,
          resetPasswordExpiresAt: null,
          password,
        },
      );
      return ApiSuccessResponse(
        new UserEntity(userUpdated),
        'Password changed',
      );
    } catch (error) {
      this.logger.error(`Error while changing user password`, error);
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }
  }

  public async initiateVerifyEmail(email: string): Promise<ApiResponse> {
    try {
      const user = await this.userRepoService.findByEmail(email, null, {
        lean: true,
      });
      if (user.emailVerified) {
        throw new HttpException(
          'Email already verified',
          HttpStatus.BAD_REQUEST,
        );
      }
      const emailVerifyToken = await createPasswordHash(
        `${user.email}_${new Date().getTime()}`,
      );
      const emailVerifyExpiresAt = add(new Date(), {
        days: 1,
      });
      const userUpdated = await this.userRepoService.findByIdAndUpdate(
        user._id,
        {
          emailVerifyToken,
          emailVerifyExpiresAt,
        },
      );
      await this.userJobQueue.add(
        QUEUE_CONSTANTS.USER_SERVICE_QUEUE.TASKS.SEND_EMAIL_VERIFY_EMAIL,
        {
          userData: userUpdated.toObject(),
        },
      );
      return ApiSuccessResponse(
        new UserEntity(userUpdated),
        'Initiated user verify email',
      );
    } catch (error) {
      this.logger.error(`Error while sending email verify email`, error);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  public async verifyEmail(emailVerifyToken: string): Promise<ApiResponse> {
    try {
      const user = await this.userRepoService.findOne({
        emailVerifyToken,
      });
      if (isBefore(user.resetPasswordExpiresAt, new Date())) {
        throw new HttpException('Link expired', HttpStatus.NOT_FOUND);
      }
      const userUpdated = await this.userRepoService.findByIdAndUpdate(
        user._id,
        {
          emailVerifyToken: null,
          emailVerifyExpiresAt: null,
          emailVerified: true,
        },
      );
      return ApiSuccessResponse(new UserEntity(userUpdated), 'Email verified');
    } catch (error) {
      this.logger.error(`Error while verifying user email`, error);
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }
  }
}
