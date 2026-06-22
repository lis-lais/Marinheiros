import { Body, Controller, Get, Param, Post, UseGuards, Req, Query } from '@nestjs/common';
import { SailorProxyService } from '../services/sailor-proxy.service';
import { ScheduleProxyService } from '../services/schedule-proxy.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';

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

  @Post('schedules/profile')
  @UseGuards(JwtAuthGuard)
  updateScheduleProfile(@Req() req: any, @Body() body: Record<string, unknown>) {
    const sailorId = req.user.userId;
    return this.scheduleProxy.updateProfile({
      ...body,
      sailorId
    });
  }

  @Get('schedules/calendar')
  @UseGuards(JwtAuthGuard)
  getCalendarProjections(@Req() req: any, @Query('year') year: string, @Query('month') month: string) {
    const sailorId = req.user.userId;
    return this.scheduleProxy.getProjections(sailorId, year, month);
  }

  @Get('schedules/notifications')
  @UseGuards(JwtAuthGuard)
  getNotifications(@Req() req: any) {
    const sailorId = req.user.userId;
    return this.scheduleProxy.getNotifications(sailorId);
  }

  @Post('schedules/confirm')
  @UseGuards(JwtAuthGuard)
  confirmTransition(@Req() req: any, @Body() body: Record<string, unknown>) {
    const sailorId = req.user.userId;
    return this.scheduleProxy.confirmTransition({
      ...body,
      sailorId
    });
  }

  @Post('schedules/trigger-cron')
  triggerCron() {
    return this.scheduleProxy.triggerCron();
  }
}
