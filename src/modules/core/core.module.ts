import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { QUEUE_CONSTANTS } from 'src/config';
import { AwsS3Service } from './services/aws.s3.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.USER_SERVICE_QUEUE.NAME,
    }),
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.NAME,
    }),
  ],
  providers: [AwsS3Service],
  exports: [BullModule, AwsS3Service],
})
export class CoreModule {}
