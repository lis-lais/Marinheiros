import { Sailor } from '../entities/sailor.entity';

export interface SailorRepository {
  create(sailor: Sailor): Promise<void>;
  findById(id: string): Promise<Sailor | null>;
  findAll(): Promise<Sailor[]>;
}
