import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class DeleteGeoFenceDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
