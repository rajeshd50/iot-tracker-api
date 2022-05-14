import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { QUEUE_CONSTANTS } from 'src/config';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as multer from 'multer';

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: path.join(__dirname, '../../../uploads'),
        preservePath: true,
        storage: multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, 'uploads');
          },
          filename: function (req, file, cb) {
            cb(
              null,
              nanoid() + '_' + Date.now() + path.extname(file.originalname),
            );
          },
        }),
      }),
    }),
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.USER_SERVICE_QUEUE.NAME,
    }),
    BullModule.registerQueue({
      name: QUEUE_CONSTANTS.DEVICE_SERVICE_QUEUE.NAME,
    }),
  ],
  exports: [BullModule],
})
export class CoreModule {}
