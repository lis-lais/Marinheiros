import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';

export class GetSailorByIdUseCase {
  constructor(private readonly repository: SailorRepository) {}

  async execute(id: string): Promise<Sailor | null> {
    return this.repository.findById(id);
  }
}
