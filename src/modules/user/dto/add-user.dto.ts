import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
