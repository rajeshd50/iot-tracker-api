import { Exclude, Expose } from 'class-transformer';
import { SITE_CONFIG_TYPES } from 'src/config';

export class SiteConfigEntity {
  @Expose()
  public get id() {
    return this._id && typeof this._id === 'object'
      ? (this._id as any).toHexString()
      : this._id;
  }
  @Exclude()
  _id: object;

  @Exclude()
  __v: number;

  createdAt: Date;
  updatedAt?: Date;

  key: string;
  value?: string;
  type: SITE_CONFIG_TYPES | string;
  description?: string;
  isActive: boolean;
  isMultipleEntry: boolean;

  constructor(partial: Partial<SiteConfigEntity>) {
    Object.assign(this, partial);
  }
}
