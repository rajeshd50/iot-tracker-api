import { IsNotEmpty, IsString } from 'class-validator';

export class DevicePoolMarkAsConfiguredDto {
  @IsString()
  @IsNotEmpty()
  serial: string;
}
