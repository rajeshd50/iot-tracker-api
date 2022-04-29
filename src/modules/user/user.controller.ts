import { Body, Controller, Get, Post } from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
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
  @Get('users')
  async getAllUsers(@UserData() user: UserEntity) {
    return this.userService.getAllUsers(user);
  }

  @Roles(ROLE.USER)
  @Post('')
  async updateUser(@Body() data: UpdateUserDto, @UserData() user: UserEntity) {
    return this.userService.updateUser(data, user);
  }
}
