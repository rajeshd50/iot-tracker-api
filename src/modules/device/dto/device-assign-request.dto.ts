import { IsNotEmpty, IsString } from 'class-validator';
import { DeviceGeneralUpdateDto } from './device-update.dto';

export class DeviceRequestAssignmentDto extends DeviceGeneralUpdateDto {
  @IsString()
  @IsNotEmpty()
  serial: string;
}
