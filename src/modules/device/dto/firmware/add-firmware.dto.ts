import { IsNotEmpty, IsSemVer } from 'class-validator';

export class AddFirmwareDto {
  @IsNotEmpty()
  @IsSemVer()
  version: string;
}
