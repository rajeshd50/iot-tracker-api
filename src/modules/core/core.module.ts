import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { QUEUE_CONSTANTS } from 'src/config';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.USER_SERVICE_QUEUE.NAME,
    }),
  ],
  exports: [BullModule],
})
export class CoreModule {}
