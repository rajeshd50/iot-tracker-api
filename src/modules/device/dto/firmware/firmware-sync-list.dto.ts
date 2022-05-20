import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class FirmwareSyncListDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
