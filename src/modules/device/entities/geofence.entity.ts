import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { User } from 'src/modules/database/schemas/user.schema';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export class GeoFenceEntity {
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

  name: string;
  isActive: boolean;
  description?: string;

  @Type(() => UserEntity)
  @Transform((param) => new UserEntity(param.value))
  user: User;

  @Exclude()
  fence: any;

  bound: any;
  type: any;
  circleCenter?: any;
  circleRadius?: number;
  rectangleBound?: any;

  attachedDeviceSerials: string[];

  @Expose()
  public get coordinates() {
    return this.fence && this.fence.coordinates && this.fence.coordinates[0]
      ? this.fence.coordinates[0].map((coord) => {
          return {
            lat: coord[1],
            lng: coord[0],
          };
        })
      : [];
  }

  @Expose()
  public get totalDevicesAttached() {
    return this.attachedDeviceSerials ? this.attachedDeviceSerials.length : 0;
  }

  constructor(partial: Partial<GeoFenceEntity>) {
    Object.assign(this, partial);
  }
}
