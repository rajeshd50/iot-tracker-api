import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ROLE } from 'src/config';

export class UserEntity {
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

  email: string;

  @Exclude()
  password: string;

  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: ROLE;

  createdAt: string;
  updatedAt: string;

  @Exclude()
  emailVerifyToken: string;

  @Exclude()
  emailVerifyExpiresAt: Date;

  @Exclude()
  resetPasswordToken: string;

  @Exclude()
  resetPasswordExpiresAt: Date;

  emailVerified: boolean;
  isActive: boolean;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  primaryContactNumber?: string;
  secondaryContactNumber?: string;
  alternateEmailAddress?: string;
  maxDevice: number;
  maxFencePerDevice: number;

  @Expose()
  get fullName(): string {
    return [this.title, this.firstName, this.middleName, this.lastName]
      .filter((str) => !!str)
      .join(' ');
  }

  @Expose()
  get isAdmin(): boolean {
    return this.role === ROLE.ADMIN;
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
