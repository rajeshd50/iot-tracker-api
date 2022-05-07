import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteConfigDocument = SiteConfig & Document;

@Schema({
  timestamps: true,
})
export class SiteConfig {
  @Prop({ required: true, index: true, unique: true, lowercase: true })
  key: string;

  @Prop()
  value: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);
