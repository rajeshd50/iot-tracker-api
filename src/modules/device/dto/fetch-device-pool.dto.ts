import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { DevicePoolStatus } from 'src/config';

export class FetchDevicePoolDto {
  @IsString()
  @IsOptional()
  serial: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DevicePoolStatus)
  status: DevicePoolStatus;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
