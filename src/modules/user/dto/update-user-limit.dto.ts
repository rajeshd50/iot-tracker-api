import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class UpdateUserLimitDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(-1)
  @Max(1000)
  maxDevice: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(-1)
  @Max(100)
  maxFencePerDevice: number;
}
