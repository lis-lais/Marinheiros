import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Embarkation } from '../../domain/entities/embarkation.entity';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';
import { DateRange } from '../../domain/value-objects/date-range.vo';
import { REPOSITORIES } from '../../infrastructure/constants/providers.constants';

@Injectable()
export class ScheduleService {
  constructor(@Inject(REPOSITORIES.Embarkation) private readonly repository: EmbarkationRepository) {}

  async scheduleEmbarkation(
    sailorId: string,
    vesselName: string,
    embarkDate: string,
    disembarkDate: string
  ): Promise<Embarkation> {
    const period = new DateRange(new Date(embarkDate), new Date(disembarkDate));
    const embarkation = new Embarkation(randomUUID(), sailorId, vesselName, period);
    await this.repository.create(embarkation);
    return embarkation;
  }

  async getEmbarkationsForSailor(sailorId: string): Promise<Embarkation[]> {
    return this.repository.findBySailorId(sailorId);
  }

  async listAllEmbarkations(): Promise<Embarkation[]> {
    return this.repository.findAll();
  }
}
