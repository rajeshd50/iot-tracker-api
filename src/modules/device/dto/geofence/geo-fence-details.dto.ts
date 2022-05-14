import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class GeoFenceDetailsDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
