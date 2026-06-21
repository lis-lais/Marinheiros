import { randomUUID } from 'crypto';
import { Embarkation } from '../../domain/entities/embarkation.entity';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';
import { DateRange } from '../../domain/value-objects/date-range.vo';

export class ScheduleEmbarkationUseCase {
  constructor(private readonly repository: EmbarkationRepository) {}

  async execute(
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
}
