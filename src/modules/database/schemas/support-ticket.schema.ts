import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { DeviceDocument } from './device.schema';
import { UserDocument } from './user.schema';

export type SupportTicketDocument = SupportTicket & Document;

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  INVALID = 'invalid',
}

export enum SupportTicketLogType {
  DEFAULT = 'default',
  COMMENT = 'comment',
}

export enum SupportTicketType {
  ACCOUNT = 'account',
  PAYMENT = 'payment',
  DEVICE = 'device',
  LIMIT = 'limit',
  HELP = 'help',
  QUERY = 'query',
  TRACKING = 'tracking',
  WEB_SITE = 'web_site',
  FEEDBACK = 'feedback',
  OTHER = 'other',
}

@Schema({})
export class StatusLog {
  @Prop({
    required: true,
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
  })
  status: SupportTicketStatus;

  @Prop({ required: false })
  comment: string;

  @Prop({
    required: true,
    enum: SupportTicketLogType,
    default: SupportTicketLogType.DEFAULT,
  })
  type: SupportTicketLogType;

  @Prop({ required: true, default: new Date() })
  updatedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  updatedBy: UserDocument;
}

@Schema({
  timestamps: true,
})
export class SupportTicket {
  @Prop({
    required: true,
    enum: SupportTicketType,
    default: SupportTicketType.FEEDBACK,
  })
  type: SupportTicketType;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  ticketNumber: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
  })
  lastStatus: SupportTicketStatus;

  @Prop({ required: true, default: new Date() })
  lastStatusUpdatedAt: Date;

  @Prop({
    required: true,
  })
  statusLog: StatusLog[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Device',
    required: false,
  })
  relatedDevice: DeviceDocument;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
