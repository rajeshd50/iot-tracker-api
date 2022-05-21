import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SITE_CONFIG_TYPES } from 'src/config';

export type SiteConfigDocument = SiteConfig & Document;

@Schema({
  timestamps: true,
})
export class SiteConfig {
  @Prop({ required: true, index: true, unique: true, lowercase: true })
  key: string;

  @Prop({
    required: true,
    enum: SITE_CONFIG_TYPES,
    default: SITE_CONFIG_TYPES.TEXT,
  })
  type: SITE_CONFIG_TYPES;

  @Prop({ required: false, default: '' })
  value: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ default: false })
  isMultipleEntry: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);
