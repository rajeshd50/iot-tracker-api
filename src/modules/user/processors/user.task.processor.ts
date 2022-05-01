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
          )}`,
        },
        template: 'user-reset-password-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending reset password email`);
    }
  }
}
