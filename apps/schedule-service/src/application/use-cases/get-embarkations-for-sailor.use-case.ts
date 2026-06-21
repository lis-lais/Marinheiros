import { Embarkation } from '../../domain/entities/embarkation.entity';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';

export class GetEmbarkationsForSailorUseCase {
  constructor(private readonly repository: EmbarkationRepository) {}

  async execute(sailorId: string): Promise<Embarkation[]> {
    return this.repository.findBySailorId(sailorId);
  }
}
