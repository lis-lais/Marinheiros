import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';

export class ListSailorsUseCase {
  constructor(private readonly repository: SailorRepository) {}

  async execute(): Promise<Sailor[]> {
    return this.repository.findAll();
  }
}
