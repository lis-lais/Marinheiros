import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateEmbarkationDto } from '../../application/dto/create-embarkation.dto';
import { ScheduleService } from '../../application/services/schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  async create(@Body() body: CreateEmbarkationDto) {
    const embarkation = await this.scheduleService.scheduleEmbarkation(
      body.sailorId,
      body.vesselName,
      body.embarkDate,
      body.disembarkDate
    );
    return {
      id: embarkation.id,
      sailorId: embarkation.sailorId,
      vesselName: embarkation.vesselName,
      embarkDate: embarkation.period.startDate,
      disembarkDate: embarkation.period.endDate,
      createdAt: embarkation.createdAt
    };
  }

  @Get('sailor/:sailorId')
  async getBySailor(@Param('sailorId') sailorId: string) {
    const records = await this.scheduleService.getEmbarkationsForSailor(sailorId);
    return records.map((entry) => ({
      id: entry.id,
      sailorId: entry.sailorId,
      vesselName: entry.vesselName,
      embarkDate: entry.period.startDate,
      disembarkDate: entry.period.endDate,
      createdAt: entry.createdAt
    }));
  }

  @Get()
  async list() {
    const records = await this.scheduleService.listAllEmbarkations();
    return records.map((entry) => ({
      id: entry.id,
      sailorId: entry.sailorId,
      vesselName: entry.vesselName,
      embarkDate: entry.period.startDate,
      disembarkDate: entry.period.endDate,
      createdAt: entry.createdAt
    }));
  }
}
