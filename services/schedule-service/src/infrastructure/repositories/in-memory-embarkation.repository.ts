import { Injectable } from '@nestjs/common';
import { Embarkation } from '../../domain/entities/embarkation.entity';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';

@Injectable()
export class InMemoryEmbarkationRepository implements EmbarkationRepository {
  private records: Embarkation[] = [];

  async create(entry: Embarkation): Promise<void> {
    this.records.push(entry);
  }

  async findBySailorId(sailorId: string): Promise<Embarkation[]> {
    return this.records.filter((entry) => entry.sailorId === sailorId);
  }

  async findAll(): Promise<Embarkation[]> {
    return [...this.records];
  }
}
