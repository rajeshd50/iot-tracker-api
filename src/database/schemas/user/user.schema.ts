import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ROLE_TYPES, STRING_CONSTANTS } from 'src/constants';
import { Role, RoleDocument, RoleSchema } from './role.schema';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true, index: true })
  userName: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true })
  role: Role;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  isAdmin: () => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.isAdmin = async function (): Promise<boolean> {
  const foundRole: RoleDocument = await mongoose
    .model('Role', RoleSchema, 'roles', {
      
    })
    .findById(this.role);
  return foundRole.type === ROLE_TYPES.ADMIN;
};
