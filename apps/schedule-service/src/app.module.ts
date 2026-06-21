import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleController } from './infrastructure/controllers/schedule.controller';
import { InMemoryEmbarkationRepository } from './infrastructure/repositories/in-memory-embarkation.repository';
import { MongooseEmbarkationRepository } from './infrastructure/repositories/mongoose-embarkation.repository';
import { EmbarkationSchema } from './infrastructure/schemas/embarkation.schema';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq.service';
import { SailorCreatedConsumer } from './infrastructure/messaging/consumer.service';
import { REPOSITORIES, USE_CASES } from './infrastructure/constants/providers.constants';
import { ScheduleEmbarkationUseCase } from './application/use-cases/schedule-embarkation.use-case';
import { GetEmbarkationsForSailorUseCase } from './application/use-cases/get-embarkations-for-sailor.use-case';
import { ListAllEmbarkationsUseCase } from './application/use-cases/list-all-embarkations.use-case';
import { EmbarkationRepository } from './domain/repositories/embarkation.repository';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/marinheiros'),
    MongooseModule.forFeature([{ name: 'Embarkation', schema: EmbarkationSchema }])
  ],
  controllers: [ScheduleController],
  providers: [
    RabbitMQService,
    SailorCreatedConsumer,
    {
      provide: REPOSITORIES.Embarkation,
      useClass: MongooseEmbarkationRepository
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
    InMemoryEmbarkationRepository
  ]
})
export class AppModule {}
