import { Expose } from 'class-transformer';

export class DashboardDeviceCountEntity {
  total: number;
  active: number;
  purchased: number;

  @Expose()
  get inactive(): number {
    return this.total - this.active;
  }

  @Expose()
  get inStock(): number {
    return this.total - this.purchased;
  }

  constructor(partial: Partial<DashboardDeviceCountEntity>) {
    Object.assign(this, partial);
  }
}
