import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FetchGeoFencesDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
