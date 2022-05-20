import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { DeviceFirmwareDocument } from './device-firmware.schema';
import { DeviceDocument } from './device.schema';
import { UserDocument } from './user.schema';

export type DeviceFirmwareSyncDocument = DeviceFirmwareSync & Document;

@Schema({
  timestamps: true,
})
export class DeviceFirmwareSync {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'DeviceFirmware',
    required: false,
  })
  firmware: DeviceFirmwareDocument;

  @Prop({ required: true, index: true, unique: true })
  syncJobId: string;

  @Prop({ required: false })
  completedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  syncBy: UserDocument;

  @Prop({ default: false })
  isAllDeviceSelected: boolean;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Device',
    required: false,
  })
  attachedDevices: DeviceDocument[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Device',
    required: false,
  })
  confirmedDevices: DeviceDocument[];

  @Prop({ required: false, default: 0 })
  confirmedCount: number;

  @Prop({ required: false, default: 0 })
  totalDeviceCount: number;
}

export const DeviceFirmwareSyncSchema =
  SchemaFactory.createForClass(DeviceFirmwareSync);
