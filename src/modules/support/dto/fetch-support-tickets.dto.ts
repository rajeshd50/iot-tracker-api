import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import { SupportTicketStatus } from 'src/modules/database/schemas/support-ticket.schema';

export class FetchSupportTicketsDto {
  @IsString()
  @IsOptional()
  searchText: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(SupportTicketStatus)
  status: SupportTicketStatus;

  @IsOptional()
  @IsMongoId()
  @ValidateIf((o) => !!o.user)
  user: string;

  @IsOptional()
  @IsMongoId()
  @ValidateIf((o) => !!o.device)
  device: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
