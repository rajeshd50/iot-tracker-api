import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class SyncFirmwareDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
