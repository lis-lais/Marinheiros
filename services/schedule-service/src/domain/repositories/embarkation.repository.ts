import { Embarkation } from '../entities/embarkation.entity';

export interface EmbarkationRepository {
  create(entry: Embarkation): Promise<void>;
  findBySailorId(sailorId: string): Promise<Embarkation[]>;
  findAll(): Promise<Embarkation[]>;
}
