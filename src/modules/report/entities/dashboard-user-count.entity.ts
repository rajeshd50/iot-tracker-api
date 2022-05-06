import { Expose } from 'class-transformer';

export class DashboardUserCountEntity {
  total: number;
  active: number;

  @Expose()
  get inactive(): number {
    return this.total - this.active;
  }
  constructor(partial: Partial<DashboardUserCountEntity>) {
    Object.assign(this, partial);
  }
}
