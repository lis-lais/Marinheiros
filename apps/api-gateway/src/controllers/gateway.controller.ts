import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SailorProxyService } from '../services/sailor-proxy.service';
import { ScheduleProxyService } from '../services/schedule-proxy.service';

@Controller()
export class GatewayController {
  constructor(
    private readonly sailorProxy: SailorProxyService,
    private readonly scheduleProxy: ScheduleProxyService
  ) {}

  @Post('sailors')
  createSailor(@Body() body: Record<string, unknown>) {
    return this.sailorProxy.createSailor(body);
  }

  @Get('sailors')
  listSailors() {
    return this.sailorProxy.listSailors();
  }

  @Get('sailors/:id')
  getSailor(@Param('id') id: string) {
    return this.sailorProxy.getSailor(id);
  }

  @Post('schedules')
  createSchedule(@Body() body: Record<string, unknown>) {
    return this.scheduleProxy.createSchedule(body);
  }

  @Get('schedules')
  listSchedules() {
    return this.scheduleProxy.listSchedules();
  }

  @Get('schedules/sailor/:sailorId')
  getScheduleBySailor(@Param('sailorId') sailorId: string) {
    return this.scheduleProxy.getScheduleBySailor(sailorId);
  }
}
