import { IsEmail, IsNotEmpty } from 'class-validator';

export class InitiateEmailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
