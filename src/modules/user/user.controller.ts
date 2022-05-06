import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { FetchUserDto } from './dto/user-fetch.dto';
import { UpdateUserDto } from './dto/user.update.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@UserData() user: UserEntity) {
    return this.userService.getUserProfile(user.email);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('users')
  async getAllUsers(@Body() data: FetchUserDto, @UserData() user: UserEntity) {
    return this.userService.getAllUsers(data, user);
  }

  @Roles(ROLE.USER)
  @Post('')
  async updateUser(@Body() data: UpdateUserDto, @UserData() user: UserEntity) {
    return this.userService.updateUser(data, user);
  }
}
