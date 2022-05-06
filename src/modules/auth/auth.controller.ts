import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { InitiateEmailVerificationDto } from './dto/initiate-email-verification.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Public()
  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return this.authService.register(registerData);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('forget-password')
  async forgetPassword(@Body() data: ForgetPasswordDto) {
    return this.authService.forgetPassword(data);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('send-verification-email')
  async sendEmailVerificationMail(@Body() data: InitiateEmailVerificationDto) {
    return this.authService.sendEmailVerificationMail(data);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() data: VerifyEmailDto) {
    return this.authService.verifyEmail(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Body() data: ChangePasswordDto,
    @UserData() user: UserEntity,
  ) {
    return this.authService.changePassword(data, user);
  }
}
