import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DeviceFirmwareSyncStatus } from 'src/modules/database/schemas/device-firmware.schema';

export class FetchFirmwareDto {
  @IsString()
  @IsOptional()
  version: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceFirmwareSyncStatus)
  syncStatus: DeviceFirmwareSyncStatus;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
