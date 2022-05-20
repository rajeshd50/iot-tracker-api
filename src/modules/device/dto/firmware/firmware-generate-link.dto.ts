import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class FirmwareGenerateLinkDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
