import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { DeviceAssignStatus, DeviceLiveStatus, DeviceStatus } from 'src/config';

export class FetchDeviceDto {
  @IsString()
  @IsOptional()
  serial: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceStatus)
  status: DeviceStatus;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceAssignStatus)
  assignStatus: DeviceAssignStatus;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceLiveStatus)
  liveStatus: DeviceLiveStatus;

  @IsOptional()
  @IsString()
  user: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
