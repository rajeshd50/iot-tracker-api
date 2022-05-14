import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class DeleteFirmwareDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
