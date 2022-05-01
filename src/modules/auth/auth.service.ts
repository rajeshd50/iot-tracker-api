import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiSuccessResponse } from 'src/common/app.response';

import { UserService } from '../user/user.service';
import { comparePassword } from './auth.util';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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

  public async login(userFromReq: any) {
    try {
      const payload = {
        email: userFromReq.email,
        sub: {},
      };
      const user = await this.userService.findOne({
        email: userFromReq.email,
      });
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

  public async register(registerData: RegisterDto) {
    try {
      const user = await this.userService.create(registerData);
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

  public async forgetPassword(data: ForgetPasswordDto) {
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
}
