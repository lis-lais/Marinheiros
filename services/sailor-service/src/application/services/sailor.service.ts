import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';
import { Name } from '../../domain/value-objects/name.vo';

@Injectable()
export class SailorService {
  constructor(
    @Inject('SailorRepository')
    private readonly repository: SailorRepository
  ) {}

  async registerSailor(firstName: string, lastName: string, rank: string): Promise<Sailor> {
    const sailor = new Sailor(randomUUID(), new Name(firstName, lastName), rank);
    await this.repository.create(sailor);
    return sailor;
  }

  async getSailorById(id: string): Promise<Sailor | null> {
    return this.repository.findById(id);
  }

  async listSailors(): Promise<Sailor[]> {
    return this.repository.findAll();
  }
}
