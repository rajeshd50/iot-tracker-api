import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  middleName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  addressLine1: string;

  @IsString()
  @IsOptional()
  addressLine2: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  zip: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  primaryContactNumber: string;

  @IsString()
  @IsOptional()
  secondaryContactNumber: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  alternateEmailAddress: string;
}
