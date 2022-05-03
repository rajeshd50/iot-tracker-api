import { Body, Controller, Post } from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { DeviceRequestAssignmentDto } from '../dto/device-assign-request.dto';
import { DeviceUpdateDto } from '../dto/device-update.dto';
import { FetchDeviceDto } from '../dto/fetch-device.dto';
import { UpdateAssignmentApprovalDto } from '../dto/update-assignment-approval.dto';
import { DeviceService } from '../services/device.service';

@Controller('device')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Roles(ROLE.USER)
  @Post('request-assignment')
  async requestAssignment(
    @Body() data: DeviceRequestAssignmentDto,
    @UserData() user,
  ) {
    return this.deviceService.requestAssignment(data, user);
  }

  @Post('fetch')
  async fetchDevice(@Body() data: FetchDeviceDto, @UserData() user) {
    return this.deviceService.fetchDevice(data, user);
  }

  @Post('update')
  async updateDevice(@Body() data: DeviceUpdateDto, @UserData() user) {
    return this.deviceService.updateDevice(data, user);
  }

  @Roles(ROLE.ADMIN)
  @Post('update-approval')
  async updateApprovalForAssignment(
    @Body() data: UpdateAssignmentApprovalDto,
    @UserData() user,
  ) {
    return this.deviceService.updateApprovalForAssignment(data, user);
  }

  @Roles(ROLE.ADMIN)
  @Post('update-status')
  async updateDeviceStatus(@Body() data: FetchDeviceDto) {
    return this.deviceService.updateDeviceStatus(data);
  }
}
