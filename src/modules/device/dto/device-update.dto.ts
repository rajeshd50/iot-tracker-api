import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeviceGeneralUpdateDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  vehicleName: string;

  @IsString()
  @IsOptional()
  vehicleNumber: string;
}

export class DeviceUpdateDto extends DeviceGeneralUpdateDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
