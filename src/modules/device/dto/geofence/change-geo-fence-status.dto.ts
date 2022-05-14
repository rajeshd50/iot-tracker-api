import { IsBoolean, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ChangeGeoFenceStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
