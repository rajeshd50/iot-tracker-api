import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateUserDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  dailyCalorieLimit: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  monthlyBudgetLimit: number;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;
}
