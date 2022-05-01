import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  resetPasswordToken: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;
}
