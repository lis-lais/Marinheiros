import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SailorController } from './infrastructure/controllers/sailor.controller';
import { InMemorySailorRepository } from './infrastructure/repositories/in-memory-sailor.repository';
import { MongooseSailorRepository } from './infrastructure/repositories/mongoose-sailor.repository';
import { SailorSchema } from './infrastructure/schemas/sailor.schema';
import { REPOSITORIES, USE_CASES, MESSAGING } from './infrastructure/constants/providers.constants';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq.service';
import { RegisterSailorUseCase } from './application/use-cases/register-sailor.use-case';
import { GetSailorByIdUseCase } from './application/use-cases/get-sailor-by-id.use-case';
import { ListSailorsUseCase } from './application/use-cases/list-sailors.use-case';
import { SailorRepository } from './domain/repositories/sailor.repository';
import { IEventPublisher } from './domain/ports/event-publisher.interface';

import { AuthenticateSailorUseCase } from './application/use-cases/authenticate-sailor.use-case';
import { ResetForgottenPasswordUseCase } from './application/use-cases/reset-forgotten-password.use-case';
import { ResetForgottenPasswordService } from './domain/services/reset-forgotten-password.service';
import { IPasswordHasher, I_PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { BcryptPasswordHasher } from './infrastructure/adapters/bcrypt-password.hasher';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/marinheiros'),
    MongooseModule.forFeature([{ name: 'Sailor', schema: SailorSchema }])
  ],
  controllers: [SailorController],
  providers: [
    RabbitMQService,
    {
      provide: MESSAGING.EventPublisher,
      useClass: RabbitMQService
    },
    {
      provide: REPOSITORIES.Sailor,
      useClass: MongooseSailorRepository
    },
    {
      provide: USE_CASES.RegisterSailor,
      useFactory: (repo: SailorRepository, pub: IEventPublisher) => new RegisterSailorUseCase(repo, pub),
      inject: [REPOSITORIES.Sailor, MESSAGING.EventPublisher]
    },
    {
      provide: USE_CASES.GetSailorById,
      useFactory: (repo: SailorRepository) => new GetSailorByIdUseCase(repo),
      inject: [REPOSITORIES.Sailor]
    },
    {
      provide: USE_CASES.ListSailors,
      useFactory: (repo: SailorRepository) => new ListSailorsUseCase(repo),
      inject: [REPOSITORIES.Sailor]
    },
    {
      provide: USE_CASES.AuthenticateSailor,
      useFactory: (repo: SailorRepository) => new AuthenticateSailorUseCase(repo),
      inject: [REPOSITORIES.Sailor]
    },
    {
      provide: I_PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: USE_CASES.ResetForgottenPassword,
      useFactory: (sailors: SailorRepository, passwords: IPasswordHasher) =>
        new ResetForgottenPasswordUseCase(new ResetForgottenPasswordService(sailors, passwords)),
      inject: [REPOSITORIES.Sailor, I_PASSWORD_HASHER],
    },
    // keep in-memory for tests or fallback
    InMemorySailorRepository
  ]
})
export class AppModule {}
