import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { GeoFenceType } from 'src/modules/database/schemas/geofence.schema';

export class GeoCoordinate {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class GeoBound {
  @IsNumber()
  @IsNotEmpty()
  north: number;

  @IsNumber()
  @IsNotEmpty()
  south: number;

  @IsNumber()
  @IsNotEmpty()
  east: number;

  @IsNumber()
  @IsNotEmpty()
  west: number;
}

export class AddGeoFenceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(3)
  @ArrayMaxSize(500)
  @Type(() => GeoCoordinate)
  coordinates: GeoCoordinate[];

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoBound)
  bound: GeoBound;

  @IsNotEmpty()
  @Type(() => String)
  @IsEnum(GeoFenceType)
  type: GeoFenceType;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoCoordinate)
  circleCenter: GeoCoordinate;

  @IsOptional()
  @IsNumber()
  @Min(0)
  circleRadius: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoBound)
  rectangleBound: GeoBound;
}
