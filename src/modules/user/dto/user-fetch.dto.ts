import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class FetchUserDto {
  @IsString()
  @IsOptional()
  searchText: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
