import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';
import { OrderByDirection } from 'src/common/api.common.interfaces';
import { DeviceAssignStatus, DeviceLiveStatus, DeviceStatus } from 'src/config';

export enum DeviceOrderBy {
  CREATED_AT = 'createdAt',
  APPROVED_AT = 'approvedAt',
  APPROVAL_REQUESTED_AT = 'approvalRequestedAt',
  LAST_SEEN_AT = 'lastSeenAt',
}

export class FetchDeviceDto {
  @IsString()
  @IsOptional()
  serial: string;

  @IsString()
  @IsOptional()
  searchText: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceStatus)
  status: DeviceStatus;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceAssignStatus)
  assignStatus: DeviceAssignStatus;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceLiveStatus)
  liveStatus: DeviceLiveStatus;

  @IsOptional()
  @IsString()
  user: string;

  @IsOptional()
  @Type(() => String)
  @IsEnum(DeviceOrderBy)
  orderBy: DeviceOrderBy;

  @IsOptional()
  @Type(() => String)
  @IsEnum(OrderByDirection)
  orderByDirection: OrderByDirection;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  perPage: number;
}
