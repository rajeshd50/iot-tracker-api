import { Controller, Post } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('seed-db')
  async seedDb() {
    return this.databaseService.seedDb();
  }

  @Post('check-db')
  async checkDb() {
    return this.databaseService.checkDb();
  }
}
