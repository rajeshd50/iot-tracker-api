import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from '../user/user.schema';

export type UserSessionDocument = UserSession & Document;

@Schema({
  timestamps: true,
})
export class UserSession {
  @Prop({
    required: true,
  })
  token: string;

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop()
  lastActive: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
