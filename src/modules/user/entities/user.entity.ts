import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ROLE } from 'src/config';
import { ObjectId } from 'mongoose';

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

  firstName: string;
  lastName: string;
  role: string;

  @Exclude()
  createdAt: string;
  @Exclude()
  updatedAt: string;

  @Exclude()
  emailVerifyToken: string;

  @Exclude()
  emailVerifyExpiresAt: Date | string;

  @Exclude()
  resetPasswordToken: string;

  @Exclude()
  resetPasswordExpiresAt: Date | string;

  emailVerified: boolean;

  @Expose()
  get fullName(): string {
    return [this.firstName, this.lastName].filter((str) => !!str).join(' ');
  }

  @Expose()
  get isAdmin(): boolean {
    return this.role === ROLE.ADMIN;
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
