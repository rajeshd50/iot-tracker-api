import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserDocument } from './user.schema';
export type GeoFenceDocument = GeoFence & Document;

export enum GeoFenceType {
  CIRCLE = 'circle',
  RECTANGLE = 'rectangle',
  POLYGON = 'polygon',
}

@Schema({})
export class Polygon {
  @Prop({ type: String, enum: ['Polygon'], required: true })
  type: string;

  @Prop({ type: [[[Number]]], required: true })
  coordinates: [[[number]]];
}

@Schema({})
export class MapBound {
  @Prop({})
  east: number;

  @Prop({})
  north: number;

  @Prop({})
  south: number;

  @Prop({})
  west: number;
}

@Schema({})
export class MapLatLng {
  @Prop({})
  lat: number;

  @Prop({})
  lng: number;
}

@Schema({
  timestamps: true,
})
export class GeoFence {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({
    required: true,
    type: Polygon,
    index: '2dsphere',
  })
  fence: Polygon;

  @Prop({ required: false })
  bound: MapBound;

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

  @Prop({
    required: true,
    enum: GeoFenceType,
    default: GeoFenceType.POLYGON,
  })
  type: GeoFenceType;

  @Prop({ required: false })
  circleCenter: MapLatLng;

  @Prop({ required: false })
  circleRadius: number;

  @Prop({ required: false })
  rectangleBound: MapBound;
}

export const GeoFenceSchema = SchemaFactory.createForClass(GeoFence);
