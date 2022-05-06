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

  @IsString()
  @IsOptional()
  driverName: string;

  @IsString()
  @IsOptional()
  driverContact: string;

  @IsString()
  @IsOptional()
  driverOtherDetails: string;
}

export class DeviceUpdateDto extends DeviceGeneralUpdateDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
