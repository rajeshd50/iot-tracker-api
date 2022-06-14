import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddSupportTicketCommentDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsString()
  comment: string;
}
