import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
} from 'src/common/app.response';
import { UserEntity } from '../user/entities/user.entity';

import { UserService } from '../user/user.service';
import { comparePassword } from './auth.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { InitiateEmailVerificationDto } from './dto/initiate-email-verification.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginEntity } from './entities/login.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOne({
        email,
      });
      if (!user) {
        return null;
      }
      const isPasswordMatch = await comparePassword(user.password, password);
      if (user && isPasswordMatch) {
        const { password, ...result } = user.toObject();
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error while validating user`, error);
      return null;
    }
  }

  public async login(userFromReq: any): Promise<ApiResponse> {
    try {
      const payload = {
        email: userFromReq.email,
        sub: {},
      };
      const user = await this.userService.findOne({
        email: userFromReq.email,
      });
      if (!user) {
        return ApiErrorResponse(
          {},
          'Invalid account, please hek email',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!user.isActive) {
        return ApiErrorResponse(
          {},
          'Account has been disabled, please contact admin',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (user) {
        const { password, ...result } = user.toObject();
        payload.sub = result;
      }
      return ApiSuccessResponse(
        new LoginEntity({
          accessToken: this.jwtService.sign(payload),
          user: user.toObject(),
        }),
        'Login success',
        HttpStatus.CREATED,
      );
    } catch (error) {
      this.logger.error(`Error while login user`, error);
      throw new HttpException(
        'Error while login in',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async register(registerData: RegisterDto): Promise<ApiResponse> {
    try {
      const user = await this.userService.create(registerData);
      await this.userService.initiateVerifyEmail(user.email);
      return this.login(user);
    } catch (error) {
      this.logger.error(`Error while register user`, error);
      if (error instanceof HttpException) {
        throw HttpException;
      }
      throw new HttpException(
        'Error while registering user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async forgetPassword(data: ForgetPasswordDto): Promise<ApiResponse> {
    try {
      await this.userService.initiateResetPassword(data.email);
    } catch (error) {
      this.logger.error(
        `Error while sending forget password email to user`,
        error,
      );
    }
    return ApiSuccessResponse(
      {},
      'If user exists email will be sent soon',
      HttpStatus.OK,
    );
  }

  public async resetPassword(data: ResetPasswordDto) {
    try {
      await this.userService.resetPassword(data);
      return ApiSuccessResponse({}, 'Password reset success');
    } catch (error) {
      this.logger.error(`Error while resetting user password`, error);
      if (error instanceof HttpException) {
        throw HttpException;
      }
      throw new HttpException(
        'Error while resetting user password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async sendEmailVerificationMail(data: InitiateEmailVerificationDto) {
    try {
      await this.userService.initiateVerifyEmail(data.email);
      return ApiSuccessResponse({}, 'Verification email sent');
    } catch (error) {
      this.logger.error(`Error while sending email verification mail`, error);
      if (error instanceof HttpException) {
        throw HttpException;
      }
      throw new HttpException(
        'Error while sending email verification mail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async verifyEmail(data: VerifyEmailDto) {
    try {
      await this.userService.verifyEmail(data.emailVerifyToken);
      return ApiSuccessResponse({}, 'Email verified');
    } catch (error) {
      this.logger.error(`Error while verifying email`, error);
      if (error instanceof HttpException) {
        throw HttpException;
      }
      throw new HttpException(
        'Error while verifying email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async changePassword(
    data: ChangePasswordDto,
    userEntity: UserEntity,
  ): Promise<ApiResponse> {
    try {
      return this.userService.changePassword(data, userEntity);
    } catch (error) {
      this.logger.error(
        `Error while sending forget password email to user`,
        error,
      );
      if (error instanceof HttpException) {
        throw HttpException;
      }
      throw new HttpException(
        'Error while changing password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
