import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
