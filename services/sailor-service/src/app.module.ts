import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SailorController } from './infrastructure/controllers/sailor.controller';
import { SailorService } from './application/services/sailor.service';
import { InMemorySailorRepository } from './infrastructure/repositories/in-memory-sailor.repository';
import { MongooseSailorRepository } from './infrastructure/repositories/mongoose-sailor.repository';
import { SailorSchema } from './infrastructure/schemas/sailor.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/marinheiros'),
    MongooseModule.forFeature([{ name: 'Sailor', schema: SailorSchema }])
  ],
  controllers: [SailorController],
  providers: [
    SailorService,
    {
      provide: 'SailorRepository',
      useClass: MongooseSailorRepository
    },
    // keep in-memory for tests or fallback
    InMemorySailorRepository
  ]
})
export class AppModule {}
