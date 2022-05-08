import { IsNotEmpty, IsString } from 'class-validator';

export class AssignDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
