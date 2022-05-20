import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { AddUserDto } from './dto/add-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
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

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('users-with-device-stat')
  async getAllUsersWithDeviceStats(
    @Body() data: FetchUserDto,
    @UserData() user: UserEntity,
  ) {
    return this.userService.getAllUsersWithDeviceStats(data, user);
  }

  @Roles(ROLE.USER, ROLE.ADMIN)
  @Post('')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Body() data: UpdateUserDto, @UserData() user: UserEntity) {
    return this.userService.updateUser(data, user);
  }

  @Roles(ROLE.ADMIN)
  @Post('add-user')
  async addUser(@Body() data: AddUserDto) {
    return this.userService.addUser(data);
  }

  @Roles(ROLE.ADMIN)
  @Get('user-details/:id')
  async getUserDetails(@Param('id') id: string) {
    return this.userService.getUserDetails(id);
  }

  @Roles(ROLE.ADMIN)
  @Post('update-user-status')
  async updateUserStatus(@Body() data: UpdateUserStatusDto) {
    return this.userService.updateUserStatus(data);
  }
}
