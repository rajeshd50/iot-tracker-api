import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ROLE_TYPES } from 'src/constants';

export type RoleDocument = Role & Document;

@Schema({
  timestamps: true,
})
export class Role {
  @Prop({ required: true, enum: ROLE_TYPES, default: ROLE_TYPES.USER })
  type: ROLE_TYPES;

  @Prop({
    default: true,
  })
  isActive: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
