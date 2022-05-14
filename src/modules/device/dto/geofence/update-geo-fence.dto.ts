import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { AddGeoFenceDto } from './add-geo-fence.dto';

export class UpdateGeoFenceDto extends AddGeoFenceDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;
}
