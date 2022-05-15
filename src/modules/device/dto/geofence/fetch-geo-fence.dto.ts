import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { GeoFenceStatus } from 'src/config';

export class FetchGeoFencesDto {
  @IsString()
  @IsOptional()
  searchText: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(GeoFenceStatus)
  status: GeoFenceStatus;

  @IsOptional()
  @IsString()
  withoutDeviceSerial: string;

  @IsString()
  @IsOptional()
  deviceSerial: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
