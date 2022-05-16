import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserDocument } from './user.schema';

export type DeviceFirmwareDocument = DeviceFirmware & Document;

export enum DeviceFirmwareSyncStatus {
  NOT_SYNCED = 'not_synced',
  SYNCED = 'synced',
}

@Schema({
  timestamps: true,
})
export class DeviceFirmware {
  @Prop({ required: true, index: true, unique: true, lowercase: true })
  version: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: false })
  fileUrl: string;

  @Prop({ default: false })
  isLatest: boolean;

  @Prop({ required: false, default: 0 })
  devicesSynced: number;

  @Prop({
    required: true,
    enum: DeviceFirmwareSyncStatus,
    default: DeviceFirmwareSyncStatus.NOT_SYNCED,
  })
  syncStatus: DeviceFirmwareSyncStatus;

  @Prop({ required: false })
  syncAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  syncBy: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  createdBy: UserDocument;
}

export const DeviceFirmwareSchema =
  SchemaFactory.createForClass(DeviceFirmware);
