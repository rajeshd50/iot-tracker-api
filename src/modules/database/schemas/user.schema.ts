import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ROLE } from 'src/config';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ index: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ROLE, default: ROLE.USER })
  role: ROLE;

  @Prop({
    default: false,
  })
  emailVerified: boolean;

  @Prop()
  emailVerifyToken: string;

  @Prop()
  emailVerifyExpiresAt: Date;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpiresAt: Date;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop()
  title: string;

  @Prop()
  firstName: string;

  @Prop()
  middleName: string;

  @Prop()
  lastName: string;

  @Prop()
  addressLine1: string;

  @Prop()
  addressLine2: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zip: string;

  @Prop()
  country: string;

  @Prop()
  primaryContactNumber: string;

  @Prop()
  secondaryContactNumber: string;

  @Prop()
  alternateEmailAddress: string;

  @Prop({ required: false, default: -1 })
  maxDevice: number;

  @Prop({ required: false, default: -1 })
  maxFencePerDevice: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
