import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class DeleteDeviceDto {
  @ValidateIf((o) => !o.serial)
  @IsString()
  @IsNotEmpty()
  id: string;

  @ValidateIf((o) => !o.id)
  @IsString()
  @IsNotEmpty()
  serial: string;
}
