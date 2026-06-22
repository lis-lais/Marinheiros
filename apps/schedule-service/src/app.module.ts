import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleController } from './infrastructure/controllers/schedule.controller';
import { InMemoryEmbarkationRepository } from './infrastructure/repositories/in-memory-embarkation.repository';
import { MongooseEmbarkationRepository } from './infrastructure/repositories/mongoose-embarkation.repository';
import { EmbarkationSchema } from './infrastructure/schemas/embarkation.schema';
import { SailorScheduleProfileSchema } from './infrastructure/schemas/sailor-schedule-profile.schema';
import { PendingConfirmationSchema } from './infrastructure/schemas/pending-confirmation.schema';
import { MongooseSailorScheduleProfileRepository } from './infrastructure/repositories/mongoose-sailor-schedule-profile.repository';
import { MongoosePendingConfirmationRepository } from './infrastructure/repositories/mongoose-pending-confirmation.repository';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq.service';
import { SailorCreatedConsumer } from './infrastructure/messaging/consumer.service';
import { REPOSITORIES, USE_CASES } from './infrastructure/constants/providers.constants';
import { ScheduleEmbarkationUseCase } from './application/use-cases/schedule-embarkation.use-case';
import { GetEmbarkationsForSailorUseCase } from './application/use-cases/get-embarkations-for-sailor.use-case';
import { ListAllEmbarkationsUseCase } from './application/use-cases/list-all-embarkations.use-case';
import { UpdateScheduleProfileUseCase } from './application/use-cases/update-schedule-profile.use-case';
import { GetCalendarProjectionsUseCase } from './application/use-cases/get-calendar-projections.use-case';
import { ConfirmTransitionUseCase } from './application/use-cases/confirm-transition.use-case';
import { TransitionCheckerCron } from './infrastructure/cron/transition-checker.cron';
import { EmbarkationRepository } from './domain/repositories/embarkation.repository';
import { SailorScheduleProfileRepository } from './domain/repositories/sailor-schedule-profile.repository';
import { PendingConfirmationRepository } from './domain/repositories/pending-confirmation.repository';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/marinheiros'),
    MongooseModule.forFeature([
      { name: 'Embarkation', schema: EmbarkationSchema },
      { name: 'SailorScheduleProfile', schema: SailorScheduleProfileSchema },
      { name: 'PendingConfirmation', schema: PendingConfirmationSchema }
    ])
  ],
  controllers: [ScheduleController],
  providers: [
    RabbitMQService,
    SailorCreatedConsumer,
    TransitionCheckerCron,
    {
      provide: REPOSITORIES.Embarkation,
      useClass: MongooseEmbarkationRepository
    },
    {
      provide: REPOSITORIES.SailorScheduleProfile,
      useClass: MongooseSailorScheduleProfileRepository
    },
    {
      provide: REPOSITORIES.PendingConfirmation,
      useClass: MongoosePendingConfirmationRepository
    },
    {
      provide: USE_CASES.ScheduleEmbarkation,
      useFactory: (repo: EmbarkationRepository) => new ScheduleEmbarkationUseCase(repo),
      inject: [REPOSITORIES.Embarkation]
    },
    {
      provide: USE_CASES.GetEmbarkationsForSailor,
      useFactory: (repo: EmbarkationRepository) => new GetEmbarkationsForSailorUseCase(repo),
      inject: [REPOSITORIES.Embarkation]
    },
    {
      provide: USE_CASES.ListAllEmbarkations,
      useFactory: (repo: EmbarkationRepository) => new ListAllEmbarkationsUseCase(repo),
      inject: [REPOSITORIES.Embarkation]
    },
    {
      provide: USE_CASES.UpdateScheduleProfile,
      useFactory: (repo: SailorScheduleProfileRepository) => new UpdateScheduleProfileUseCase(repo),
      inject: [REPOSITORIES.SailorScheduleProfile]
    },
    {
      provide: USE_CASES.GetCalendarProjections,
      useFactory: (repo: SailorScheduleProfileRepository) => new GetCalendarProjectionsUseCase(repo),
      inject: [REPOSITORIES.SailorScheduleProfile]
    },
    {
      provide: USE_CASES.ConfirmTransition,
      useFactory: (
        profileRepo: SailorScheduleProfileRepository,
        pendingRepo: PendingConfirmationRepository,
        embarkRepo: EmbarkationRepository
      ) => new ConfirmTransitionUseCase(profileRepo, pendingRepo, embarkRepo),
      inject: [REPOSITORIES.SailorScheduleProfile, REPOSITORIES.PendingConfirmation, REPOSITORIES.Embarkation]
    },
    InMemoryEmbarkationRepository
  ]
})
export class AppModule {}
