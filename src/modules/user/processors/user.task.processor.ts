import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';

import * as path from 'path';

import { ENV_CONSTANTS, QUEUE_CONSTANTS } from 'src/config';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../entities/user.entity';
import { UserDocument } from 'src/modules/database/schemas/user.schema';

@Processor(QUEUE_CONSTANTS.USER_SERVICE_QUEUE.NAME)
export class UserTaskProcessor {
  private logger = new Logger(UserTaskProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  @Process(QUEUE_CONSTANTS.USER_SERVICE_QUEUE.TASKS.SEND_PASSWORD_RESET_EMAIL)
  async sendResetPasswordEmail(job: Job) {
    try {
      const userData: UserDocument = job.data.userData;
      await this.mailerService.sendMail({
        to: userData.email,
        from: this.configService.get<string>(ENV_CONSTANTS.EMAIL_FROM),
        subject: `Vehicle Tracker: Reset password`,
        context: {
          name: userData.firstName,
          subject: `Vehicle Tracker: Reset password`,
          resetLink: `${this.configService.get<string>(
            ENV_CONSTANTS.UI_URL,
          )}${this.configService.get<string>(
            ENV_CONSTANTS.RESET_PASSWORD_URL,
          )}?token=${encodeURIComponent(userData.resetPasswordToken)}`,
        },
        template: 'user-reset-password-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending reset password email`);
    }
  }

  @Process(QUEUE_CONSTANTS.USER_SERVICE_QUEUE.TASKS.SEND_EMAIL_VERIFY_EMAIL)
  async sendEmailVerificationMail(job: Job) {
    try {
      const userData: UserDocument = job.data.userData;
      await this.mailerService.sendMail({
        to: userData.email,
        from: this.configService.get<string>(ENV_CONSTANTS.EMAIL_FROM),
        subject: `Vehicle Tracker: Verify Email`,
        context: {
          name: userData.firstName,
          subject: `Vehicle Tracker: Verify Email`,
          verificationLink: `${this.configService.get<string>(
            ENV_CONSTANTS.UI_URL,
          )}${this.configService.get<string>(
            ENV_CONSTANTS.VERIFY_EMAIL_URL,
          )}?token=${encodeURIComponent(userData.emailVerifyToken)}`,
        },
        template: 'user-mail-verify-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending email verify email`);
    }
  }

  @Process(QUEUE_CONSTANTS.USER_SERVICE_QUEUE.TASKS.SEND_WELCOME_EMAIL)
  async sendWelcomeEmail(job: Job) {
    try {
      const userData: UserDocument = job.data.userData;
      await this.mailerService.sendMail({
        to: userData.email,
        from: this.configService.get<string>(ENV_CONSTANTS.EMAIL_FROM),
        subject: `Vehicle Tracker: Welcome to your new account`,
        context: {
          name: userData.firstName,
          subject: `Vehicle Tracker: Welcome to your new account`,
          loginLink: `${this.configService.get<string>(
            ENV_CONSTANTS.UI_URL,
          )}${this.configService.get<string>(ENV_CONSTANTS.LOGIN_LINK)}`,
        },
        template: 'user-welcome-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending welcome email`);
    }
  }
}
