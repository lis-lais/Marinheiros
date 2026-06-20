import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateEmbarkationDto } from '../../application/dto/create-embarkation.dto';
import { ScheduleService } from '../../application/services/schedule.service';
import { presentEmbarkation } from '../presenters/embarkation.presenter';

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
    return presentEmbarkation(embarkation);
  }

  @Get('sailor/:sailorId')
  async getBySailor(@Param('sailorId') sailorId: string) {
    const records = await this.scheduleService.getEmbarkationsForSailor(sailorId);
    return records.map((entry) => ({ ...presentEmbarkation(entry) }));
  }

  @Get()
  async list() {
    const records = await this.scheduleService.listAllEmbarkations();
    return records.map((entry) => ({ ...presentEmbarkation(entry) }));
  }
}
