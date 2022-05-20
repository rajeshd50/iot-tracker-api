import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DeviceLiveStatus, DeviceAssignStatus, DeviceStatus } from 'src/config';
import { GeoFenceDocument } from './geofence.schema';
import { UserDocument } from './user.schema';

export type DeviceDocument = Device & Document;

@Schema({
  timestamps: true,
})
export class Device {
  @Prop({ required: true, index: true, unique: true, uppercase: true })
  serial: string;

  @Prop({ required: false, default: 'v1.0.0' })
  firmwareVersion: string;

  @Prop({
    required: true,
    enum: DeviceLiveStatus,
    default: DeviceLiveStatus.NA,
  })
  liveStatus: DeviceLiveStatus;

  @Prop({
    required: true,
    enum: DeviceAssignStatus,
    default: DeviceAssignStatus.NOT_ASSIGNED,
  })
  assignStatus: DeviceAssignStatus;

  @Prop({
    required: true,
    enum: DeviceStatus,
    default: DeviceStatus.INACTIVE,
  })
  status: DeviceStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
    unique: false,
  })
  user: UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  approvedBy: UserDocument;

  @Prop({ required: false })
  approvedAt: Date;

  @Prop({ required: false })
  approvalRequestedAt: Date;

  @Prop({ required: false })
  lastSeenAt: Date;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  vehicleName: string;

  @Prop({ required: false })
  vehicleNumber: string;

  @Prop({ required: false })
  driverName: string;

  @Prop({ required: false })
  driverContact: string;

  @Prop({ required: false })
  driverOtherDetails: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'GeoFence',
  })
  attachedGeoFences: GeoFenceDocument[];

  @Prop({ required: false, default: -1 })
  maxFence: number;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
