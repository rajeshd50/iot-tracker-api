import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { SupportTicketType } from 'src/modules/database/schemas/support-ticket.schema';

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsMongoId()
  @ValidateIf((o) => !!o.relatedDevice)
  relatedDevice: string;

  @IsNotEmpty()
  @Type(() => String)
  @IsEnum(SupportTicketType)
  type: SupportTicketType;
}
