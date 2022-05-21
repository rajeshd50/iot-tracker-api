import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class UpdateDeviceLimitDto {
  @IsString()
  @IsNotEmpty()
  serial: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(-1)
  @Max(100)
  maxFence: number;
}
