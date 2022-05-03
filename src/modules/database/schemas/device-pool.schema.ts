import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DevicePoolStatus } from 'src/config';

export type DevicePoolDocument = DevicePool & Document;

@Schema({
  timestamps: true,
})
export class DevicePool {
  @Prop({ required: true, index: true, unique: true, uppercase: true })
  serial: string;

  @Prop({
    required: true,
    enum: DevicePoolStatus,
    default: DevicePoolStatus.CREATED,
  })
  status: DevicePoolStatus;
}

export const DevicePoolSchema = SchemaFactory.createForClass(DevicePool);
