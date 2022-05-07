import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class FetchUserDto {
  @IsString()
  @IsOptional()
  searchText: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
