import { Body, Controller, Get, Param, Post, Query, Inject, UseFilters } from '@nestjs/common';
import { CreateEmbarkationDto } from '../../application/dto/create-embarkation.dto';
import { ScheduleEmbarkationUseCase } from '../../application/use-cases/schedule-embarkation.use-case';
import { GetEmbarkationsForSailorUseCase } from '../../application/use-cases/get-embarkations-for-sailor.use-case';
import { ListAllEmbarkationsUseCase } from '../../application/use-cases/list-all-embarkations.use-case';
import { UpdateScheduleProfileUseCase } from '../../application/use-cases/update-schedule-profile.use-case';
import { GetCalendarProjectionsUseCase } from '../../application/use-cases/get-calendar-projections.use-case';
import { ConfirmTransitionUseCase } from '../../application/use-cases/confirm-transition.use-case';
import { TransitionCheckerCron } from '../cron/transition-checker.cron';
import { PendingConfirmationRepository } from '../../domain/repositories/pending-confirmation.repository';
import { presentEmbarkation } from '../presenters/embarkation.presenter';
import { REPOSITORIES, USE_CASES } from '../constants/providers.constants';
import { DomainExceptionFilter } from '../http/domain-exception.filter';

@Controller('schedules')
@UseFilters(DomainExceptionFilter)
export class ScheduleController {
  constructor(
    @Inject(USE_CASES.ScheduleEmbarkation) private readonly scheduleEmbarkationUseCase: ScheduleEmbarkationUseCase,
    @Inject(USE_CASES.GetEmbarkationsForSailor) private readonly getEmbarkationsForSailorUseCase: GetEmbarkationsForSailorUseCase,
    @Inject(USE_CASES.ListAllEmbarkations) private readonly listAllEmbarkationsUseCase: ListAllEmbarkationsUseCase,
    @Inject(USE_CASES.UpdateScheduleProfile) private readonly updateProfileUseCase: UpdateScheduleProfileUseCase,
    @Inject(USE_CASES.GetCalendarProjections) private readonly getProjectionsUseCase: GetCalendarProjectionsUseCase,
    @Inject(USE_CASES.ConfirmTransition) private readonly confirmTransitionUseCase: ConfirmTransitionUseCase,
    @Inject(REPOSITORIES.PendingConfirmation) private readonly pendingRepo: PendingConfirmationRepository,
    private readonly checkerCron: TransitionCheckerCron
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

  @Post('profile')
  async updateProfile(
    @Body() body: {
      sailorId: string;
      scale: string;
      lastEventDate: string;
      lastEventType: 'embarked' | 'disembarked';
      vesselName?: string;
    }
  ) {
    return this.updateProfileUseCase.execute({
      sailorId: body.sailorId,
      scale: body.scale,
      lastEventDate: new Date(body.lastEventDate),
      lastEventType: body.lastEventType,
      vesselName: body.vesselName
    });
  }

  @Get('projections/:sailorId')
  async getProjections(
    @Param('sailorId') sailorId: string,
    @Query('year') year: string,
    @Query('month') month: string
  ) {
    const y = parseInt(year || new Date().getFullYear().toString(), 10);
    const m = parseInt(month || (new Date().getMonth() + 1).toString(), 10);
    return this.getProjectionsUseCase.execute(sailorId, y, m);
  }

  @Get('notifications/:sailorId')
  async getNotifications(@Param('sailorId') sailorId: string) {
    const list = await this.pendingRepo.findPendingBySailorId(sailorId);
    return list.map((p) => ({
      id: p.id,
      sailorId: p.sailorId,
      scheduledDate: p.scheduledDate,
      transitionType: p.transitionType,
      status: p.status,
      createdAt: p.createdAt
    }));
  }

  @Post('confirm')
  async confirmTransition(
    @Body() body: {
      sailorId: string;
      pendingConfirmationId: string;
      actualDate: string;
    }
  ) {
    await this.confirmTransitionUseCase.execute(
      body.sailorId,
      body.pendingConfirmationId,
      new Date(body.actualDate)
    );
    return { success: true };
  }

  @Post('trigger-cron')
  async triggerCron() {
    await this.checkerCron.checkTransitions();
    return { status: 'triggered' };
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
