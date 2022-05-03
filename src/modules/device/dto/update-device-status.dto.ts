import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceStatus } from 'src/config';

export class UpdateDeviceStatusDto {
  @IsString()
  @IsNotEmpty()
  serial: string;

  @IsNotEmpty()
  @Type(() => String)
  @IsEnum(DeviceStatus)
  status: DeviceStatus;
}
