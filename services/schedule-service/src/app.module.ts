import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleController } from './infrastructure/controllers/schedule.controller';
import { ScheduleService } from './application/services/schedule.service';
import { InMemoryEmbarkationRepository } from './infrastructure/repositories/in-memory-embarkation.repository';
import { MongooseEmbarkationRepository } from './infrastructure/repositories/mongoose-embarkation.repository';
import { EmbarkationSchema } from './infrastructure/schemas/embarkation.schema';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq.service';
import { SailorCreatedConsumer } from './infrastructure/messaging/consumer.service';
import { REPOSITORIES } from './infrastructure/constants/providers.constants';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/marinheiros'),
    MongooseModule.forFeature([{ name: 'Embarkation', schema: EmbarkationSchema }])
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    RabbitMQService,
    SailorCreatedConsumer,
    {
      provide: REPOSITORIES.Embarkation,
      useClass: MongooseEmbarkationRepository
    },
    InMemoryEmbarkationRepository
  ]
})
export class AppModule {}
