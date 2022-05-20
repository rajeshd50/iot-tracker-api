import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class SyncFirmwareDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  isAllDeviceSelected: boolean;

  @ValidateIf((o) => !o.isAllDeviceSelected)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @Type(() => String)
  attachedDevices: string[];
}
