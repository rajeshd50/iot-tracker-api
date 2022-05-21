import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { SiteConfigEntity } from './site-config.entity';

class SiteConfigCollection extends Array<SiteConfigEntity> {}

export class SiteConfigListEntity {
  @Type(() => SiteConfigEntity)
  @Transform((param) =>
    param.value.map((dpEntity) => new SiteConfigEntity(dpEntity)),
  )
  items: SiteConfigCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<SiteConfigListEntity>) {
    Object.assign(this, partial);
  }
}
