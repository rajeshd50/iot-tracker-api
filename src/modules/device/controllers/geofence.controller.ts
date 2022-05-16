import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ROLE } from 'src/config';
import { Roles } from 'src/decorators/user-role.decorator';
import { UserData } from 'src/decorators/user.decorator';
import { AddGeoFenceDto } from '../dto/geofence/add-geo-fence.dto';
import { ChangeGeoFenceStatusDto } from '../dto/geofence/change-geo-fence-status.dto';
import { DeleteGeoFenceDto } from '../dto/geofence/delete-geo-fence.dto';
import { FetchDeviceAllGeoFencesDto } from '../dto/geofence/fetch-device-all-geo-fence.dto';
import { FetchGeoFencesDto } from '../dto/geofence/fetch-geo-fence.dto';
import { GeoFenceDetailsDto } from '../dto/geofence/geo-fence-details.dto';
import { UpdateGeoFenceToDeviceDto } from '../dto/geofence/update-fence-to-device.dto';
import { UpdateGeoFenceDto } from '../dto/geofence/update-geo-fence.dto';
import { GeoFenceService } from '../services/geofence.service';

@Controller('geo-fence')
export class GeoFenceController {
  constructor(private geoFenceService: GeoFenceService) {}

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.CREATED)
  @Post('add')
  async create(@Body() data: AddGeoFenceDto, @UserData() user) {
    return this.geoFenceService.create(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.CREATED)
  @Post('update')
  async update(@Body() data: UpdateGeoFenceDto, @UserData() user) {
    return this.geoFenceService.update(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('details')
  async getDetails(@Body() data: GeoFenceDetailsDto, @UserData() user) {
    return this.geoFenceService.getDetails(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('fetch')
  async fetchGeoFences(@Body() data: FetchGeoFencesDto, @UserData() user) {
    return this.geoFenceService.fetchGeoFences(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('fetch-device-fences-all')
  async fetchDeviceAllGeoFences(
    @Body() data: FetchDeviceAllGeoFencesDto,
    @UserData() user,
  ) {
    return this.geoFenceService.fetchDeviceAllGeoFences(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('remove')
  async deleteFence(@Body() data: DeleteGeoFenceDto, @UserData() user) {
    return this.geoFenceService.deleteFence(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('add-to-device')
  async addFenceToDevice(
    @Body() data: UpdateGeoFenceToDeviceDto,
    @UserData() user,
  ) {
    return this.geoFenceService.addFenceToDevice(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.OK)
  @Post('remove-from-device')
  async removeFenceFromDevice(
    @Body() data: UpdateGeoFenceToDeviceDto,
    @UserData() user,
  ) {
    return this.geoFenceService.removeFenceFromDevice(data, user);
  }

  @Roles(ROLE.USER)
  @HttpCode(HttpStatus.CREATED)
  @Post('change-status')
  async changeFenceStatus(
    @Body() data: ChangeGeoFenceStatusDto,
    @UserData() user,
  ) {
    return this.geoFenceService.changeFenceStatus(data, user);
  }
}
