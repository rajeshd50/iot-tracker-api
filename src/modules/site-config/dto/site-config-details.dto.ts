import { IsNotEmpty, IsString } from 'class-validator';

export class SiteConfigDetailsDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}
