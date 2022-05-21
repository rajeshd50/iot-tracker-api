import { Inject, Injectable, Logger } from '@nestjs/common';
import { SITE_CONFIG, UNLIMITED_NUMBER } from 'src/config';
import { DeviceRepoService } from './DeviceRepo.service';
import { SiteConfigRepoService } from './SiteConfigRepo.service';
import { UserRepoService } from './UserRepo.service';

@Injectable()
export class UserLimitRepoService {
  private logger = new Logger(UserLimitRepoService.name);
  constructor(
    private readonly deviceRepoService: DeviceRepoService,
    private readonly siteConfigRepoService: SiteConfigRepoService,
    private readonly userRepoService: UserRepoService,
  ) {}

  public async getRemainingDeviceLimitForUser(userId: string | object) {
    try {
      const maxDeviceFromConfig =
        await this.siteConfigRepoService.getValueByKey<number>(
          SITE_CONFIG.MAX_DEVICE_PER_USER.text,
          UNLIMITED_NUMBER,
        );
      const userDetails = await this.userRepoService.findById(userId);
      let effectiveLimit =
        userDetails && userDetails.maxDevice !== undefined
          ? userDetails.maxDevice
          : UNLIMITED_NUMBER;
      if (effectiveLimit === UNLIMITED_NUMBER) {
        effectiveLimit = maxDeviceFromConfig;
      }
      if (effectiveLimit === UNLIMITED_NUMBER) {
        return UNLIMITED_NUMBER;
      }
      const alreadyAddedDeviceCount = await this.deviceRepoService.count({
        user: userId,
      });
      return effectiveLimit - alreadyAddedDeviceCount;
    } catch (error) {
      this.logger.error(
        `Error while fetching remaining device limit for user`,
        error,
      );
      throw error;
    }
  }

  public async getRemainingGeoFenceLimitForDevice(deviceSerial: string) {
    try {
      const maxFenceFromConfig =
        await this.siteConfigRepoService.getValueByKey<number>(
          SITE_CONFIG.MAX_GEO_FENCE_PER_DEVICE.text,
          UNLIMITED_NUMBER,
        );
      const deviceDetails = await this.deviceRepoService.findBySerial(
        deviceSerial,
      );
      const userDetails = await this.userRepoService.findById(
        deviceDetails.user._id,
      );
      const limitFromDevice =
        deviceDetails.maxFence !== undefined
          ? deviceDetails.maxFence
          : UNLIMITED_NUMBER;
      const limitFromUser =
        userDetails.maxFencePerDevice !== undefined
          ? userDetails.maxFencePerDevice
          : UNLIMITED_NUMBER;
      let effectiveLimit = limitFromDevice;
      if (effectiveLimit === UNLIMITED_NUMBER) {
        effectiveLimit = limitFromUser;
      }
      if (effectiveLimit === UNLIMITED_NUMBER) {
        effectiveLimit = maxFenceFromConfig;
      }
      if (effectiveLimit === UNLIMITED_NUMBER) {
        return UNLIMITED_NUMBER;
      }
      const alreadyAddedFenceCount = deviceDetails.attachedGeoFences
        ? deviceDetails.attachedGeoFences.length
        : 0;
      return effectiveLimit - alreadyAddedFenceCount;
    } catch (error) {
      this.logger.error(
        `Error while fetching remaining fence limit for device`,
        error,
      );
      throw error;
    }
  }
}
