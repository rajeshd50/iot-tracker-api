import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { GeoFenceEntity } from './geofence.entity';

class GeoFenceCollection extends Array<GeoFenceEntity> {}

export class GeoFenceListEntity {
  @Type(() => GeoFenceEntity)
  @Transform((param) =>
    param.value.map((dpEntity) => new GeoFenceEntity(dpEntity)),
  )
  items: GeoFenceCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<GeoFenceListEntity>) {
    Object.assign(this, partial);
  }
}
