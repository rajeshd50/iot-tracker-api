import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GeoFenceStatus } from 'src/config';

export class FetchDeviceAllGeoFencesDto {
  @IsString()
  @IsNotEmpty()
  deviceSerial: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(GeoFenceStatus)
  status: GeoFenceStatus;
}
