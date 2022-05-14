import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

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

export class AddGeoFenceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(3)
  @ArrayMaxSize(500)
  @Type(() => GeoCoordinate)
  coordinates: GeoCoordinate[];
}
