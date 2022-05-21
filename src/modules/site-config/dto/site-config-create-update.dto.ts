import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SITE_CONFIG_TYPES } from 'src/config';

export class SiteConfigCreateUpdateDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsOptional()
  value: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(SITE_CONFIG_TYPES)
  type: SITE_CONFIG_TYPES;

  @IsString()
  @IsOptional()
  description: string;
}
