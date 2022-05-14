import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserDocument } from './user.schema';
export type GeoFenceDocument = GeoFence & Document;

@Schema({})
export class Polygon {
  @Prop({ type: String, enum: ['Polygon'], required: true })
  type: string;

  @Prop({ type: [[[Number]]], required: true })
  coordinates: [[[number]]];
}

@Schema({
  timestamps: true,
})
export class GeoFence {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: Polygon,
    index: '2dsphere',
  })
  fence: Polygon;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
    unique: false,
  })
  user: UserDocument;

  @Prop({
    type: [String],
  })
  attachedDeviceSerials: string[];
}

export const GeoFenceSchema = SchemaFactory.createForClass(GeoFence);
