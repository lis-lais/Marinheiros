import { Body, Controller, Get, Param, Post, Inject, UseFilters } from '@nestjs/common';
import { CreateEmbarkationDto } from '../../application/dto/create-embarkation.dto';
import { ScheduleEmbarkationUseCase } from '../../application/use-cases/schedule-embarkation.use-case';
import { GetEmbarkationsForSailorUseCase } from '../../application/use-cases/get-embarkations-for-sailor.use-case';
import { ListAllEmbarkationsUseCase } from '../../application/use-cases/list-all-embarkations.use-case';
import { presentEmbarkation } from '../presenters/embarkation.presenter';
import { USE_CASES } from '../constants/providers.constants';
import { DomainExceptionFilter } from '../http/domain-exception.filter';

@Controller('schedules')
@UseFilters(DomainExceptionFilter)
export class ScheduleController {
  constructor(
    @Inject(USE_CASES.ScheduleEmbarkation) private readonly scheduleEmbarkationUseCase: ScheduleEmbarkationUseCase,
    @Inject(USE_CASES.GetEmbarkationsForSailor) private readonly getEmbarkationsForSailorUseCase: GetEmbarkationsForSailorUseCase,
    @Inject(USE_CASES.ListAllEmbarkations) private readonly listAllEmbarkationsUseCase: ListAllEmbarkationsUseCase
  ) {}

  @Post()
  async create(@Body() body: CreateEmbarkationDto) {
    const embarkation = await this.scheduleEmbarkationUseCase.execute(
      body.sailorId,
      body.vesselName,
      body.embarkDate,
      body.disembarkDate
    );
    return presentEmbarkation(embarkation);
  }

  @Get('sailor/:sailorId')
  async getBySailor(@Param('sailorId') sailorId: string) {
    const records = await this.getEmbarkationsForSailorUseCase.execute(sailorId);
    return records.map((entry) => ({ ...presentEmbarkation(entry) }));
  }

  @Get()
  async list() {
    const records = await this.listAllEmbarkationsUseCase.execute();
    return records.map((entry) => ({ ...presentEmbarkation(entry) }));
  }
}
