import { Embarkation } from '../../domain/entities/embarkation.entity';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';

export class ListAllEmbarkationsUseCase {
  constructor(private readonly repository: EmbarkationRepository) {}

  async execute(): Promise<Embarkation[]> {
    return this.repository.findAll();
  }
}
