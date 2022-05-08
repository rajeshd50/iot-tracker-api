import { Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';

import { ENV_CONSTANTS, QUEUE_CONSTANTS } from 'src/config';
import { ConfigService } from '@nestjs/config';
import { DeviceDocument } from 'src/modules/database/schemas/device.schema';
import { DeviceEntity } from '../entities/device.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { SiteConfigRepoService } from 'src/modules/database/repositories/SiteConfigRepo.service';

@Processor(QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.NAME)
export class DeviceTaskProcessor {
  private logger = new Logger(DeviceTaskProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    @Inject(forwardRef(() => SiteConfigRepoService))
    private siteConfigRepoService: SiteConfigRepoService,
  ) {}

  @Process(QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.APPROVAL_REQUEST_EMAIL)
  async sendDeviceApprovalRequestEmail(job: Job) {
    try {
      const deviceData: DeviceEntity = job.data.deviceData;
      const adminEmails =
        await this.siteConfigRepoService.findAdminMailingList();
      await this.mailerService.sendMail({
        to: adminEmails.join(','),
        from: this.configService.get<string>(ENV_CONSTANTS.EMAIL_FROM),
        subject: `Vehicle Tracker: new device approval request`,
        context: {
          serial: deviceData.serial,
          subject: `Vehicle Tracker: new device approval request`,
          userEmail: deviceData.user.email,
          userName: new UserEntity(deviceData.user).fullName,
          recentPurchaseUrl: `${this.configService.get<string>(
            ENV_CONSTANTS.UI_URL,
          )}${this.configService.get<string>(
            ENV_CONSTANTS.RECENT_PURCHASE_URL,
          )}`,
        },
        template: 'device-approval-request-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending device-approval-request email`);
    }
  }

  @Process(QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.APPROVAL_REJECTED_EMAIL)
  async sendDeviceApprovalRejectedEmail(job: Job) {
    try {
      const deviceData: DeviceEntity = job.data.deviceData;
      const userData: UserEntity = job.data.userData;
      await this.mailerService.sendMail({
        to: userData.email,
        from: this.configService.get<string>(ENV_CONSTANTS.EMAIL_FROM),
        subject: `Vehicle Tracker: device approval rejected`,
        context: {
          serial: deviceData.serial,
          subject: `Vehicle Tracker: device approval rejected`,
          contactLink: `${this.configService.get<string>(
            ENV_CONSTANTS.UI_URL,
          )}${this.configService.get<string>(ENV_CONSTANTS.CONTACT_URL)}`,
        },
        template: 'device-approval-rejected-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending device-approval-rejected email`);
    }
  }

  @Process(QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.APPROVAL_ACCEPTED_EMAIL)
  async sendDeviceApprovalAcceptedEmail(job: Job) {
    try {
      const deviceData: DeviceEntity = job.data.deviceData;
      await this.mailerService.sendMail({
        to: deviceData.user.email,
        from: this.configService.get<string>(ENV_CONSTANTS.EMAIL_FROM),
        subject: `Vehicle Tracker: new device request approved`,
        context: {
          serial: deviceData.serial,
          subject: `Vehicle Tracker: new device request approved`,
          name: deviceData.user.firstName,
          deviceLink: `${this.configService.get<string>(
            ENV_CONSTANTS.UI_URL,
          )}${this.configService.get<string>(
            ENV_CONSTANTS.DEVICE_DETAILS_URL,
          )}`,
        },
        template: 'device-approval-approved-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending device-approval-approved email`);
    }
  }

  @Process(QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.TASKS.DEVICE_ADDED_TO_ACCOUNT)
  async sendDeviceAddedToAccountEmail(job: Job) {
    try {
      const deviceData: DeviceEntity = job.data.deviceData;
      await this.mailerService.sendMail({
        to: deviceData.user.email,
        from: this.configService.get<string>(ENV_CONSTANTS.EMAIL_FROM),
        subject: `Vehicle Tracker: new device added`,
        context: {
          serial: deviceData.serial,
          subject: `Vehicle Tracker: new device added`,
          name: deviceData.user.firstName,
          deviceLink: `${this.configService.get<string>(
            ENV_CONSTANTS.UI_URL,
          )}${this.configService.get<string>(
            ENV_CONSTANTS.DEVICE_DETAILS_URL,
          )}`,
        },
        template: 'device-added-email',
      });
    } catch (error) {
      console.log(error);
      this.logger.log(`Error while sending device-added email`);
    }
  }
}
