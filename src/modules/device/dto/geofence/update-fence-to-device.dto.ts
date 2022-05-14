import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateGeoFenceToDeviceDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  fenceId: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  deviceId: string;
}
