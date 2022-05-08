import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { AssignDeviceDto } from '../dto/assign-device.dto';
import { DeleteDeviceDto } from '../dto/delete-device.dto';
import { DeviceRequestAssignmentDto } from '../dto/device-assign-request.dto';
import { DeviceDetailsDto } from '../dto/device-details.dto';
import { DeviceUpdateDto } from '../dto/device-update.dto';
import { FetchDeviceDto } from '../dto/fetch-device.dto';
import { UpdateAssignmentApprovalDto } from '../dto/update-assignment-approval.dto';
import { UpdateDeviceStatusDto } from '../dto/update-device-status.dto';
import { DeviceService } from '../services/device.service';

@Controller('device')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('request-assignment')
  async requestAssignment(
    @Body() data: DeviceRequestAssignmentDto,
    @UserData() user,
  ) {
    return this.deviceService.requestAssignment(data, user);
  }

  @Post('fetch')
  @HttpCode(HttpStatus.OK)
  async fetchDevice(@Body() data: FetchDeviceDto, @UserData() user) {
    return this.deviceService.fetchDevice(data, user);
  }

  @Post('update')
  @HttpCode(HttpStatus.CREATED)
  async updateDevice(@Body() data: DeviceUpdateDto, @UserData() user) {
    return this.deviceService.updateDevice(data, user);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('update-approval')
  async updateApprovalForAssignment(
    @Body() data: UpdateAssignmentApprovalDto,
    @UserData() user,
  ) {
    return this.deviceService.updateApprovalForAssignment(data, user);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('update-status')
  async updateDeviceStatus(@Body() data: UpdateDeviceStatusDto) {
    return this.deviceService.updateDeviceStatus(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('details')
  async details(@Body() data: DeviceDetailsDto, @UserData() user) {
    return this.deviceService.details(data, user);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async delete(@Body() data: DeleteDeviceDto) {
    return this.deviceService.delete(data);
  }

  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('assign')
  async assignDevice(@Body() data: AssignDeviceDto, @UserData() user) {
    return this.deviceService.assignDevice(data, user);
  }
}
