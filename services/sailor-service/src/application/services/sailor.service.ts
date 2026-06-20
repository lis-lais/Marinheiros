import { Inject, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';
import { Name } from '../../domain/value-objects/name.vo';
import { REPOSITORIES } from '../../infrastructure/constants/providers.constants';

@Injectable()
export class SailorService {
  constructor(
    @Inject(REPOSITORIES.Sailor) private readonly repository: SailorRepository,
    @Optional() private readonly publisher?: RabbitMQService
  ) {}

  async registerSailor(firstName: string, lastName: string, rank: string): Promise<Sailor> {
    const sailor = new Sailor(randomUUID(), new Name(firstName, lastName), rank);
    await this.repository.create(sailor);
    if (this.publisher) {
      try {
        await this.publisher.publish('sailor.created', { id: sailor.id, fullName: sailor.name.fullName, rank: sailor.rank });
      } catch (e) {
        // swallowing to keep behavior resilient when broker unavailable
      }
    }
    return sailor;
  }

  async getSailorById(id: string): Promise<Sailor | null> {
    return this.repository.findById(id);
  }

  async listSailors(): Promise<Sailor[]> {
    return this.repository.findAll();
  }
}
