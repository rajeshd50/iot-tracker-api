import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAssignmentApprovalDto {
  @IsString()
  @IsNotEmpty()
  serial: string;

  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;
}
