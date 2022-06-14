import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { SupportTicketStatus } from 'src/modules/database/schemas/support-ticket.schema';

export class UpdateSupportTicketStatusDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @Type(() => String)
  @IsEnum(SupportTicketStatus)
  type: SupportTicketStatus;
}
