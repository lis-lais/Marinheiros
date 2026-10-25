import { Injectable } from '@nestjs/common';
import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';

@Injectable()
export class InMemorySailorRepository implements SailorRepository {
  private sailors: Sailor[] = [];

  async create(sailor: Sailor): Promise<void> {
    this.sailors.push(sailor);
  }

  async findById(id: string): Promise<Sailor | null> {
    return this.sailors.find((sailor) => sailor.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<Sailor | null> {
    return this.sailors.find((sailor) => sailor.email === email) ?? null;
  }

  async findByNormalizedEmail(normalizedEmail: string): Promise<Sailor | null> {
    return this.sailors.find((sailor) => sailor.email.trim().toLowerCase() === normalizedEmail) ?? null;
  }

  async update(sailor: Sailor): Promise<void> {
    const index = this.sailors.findIndex((stored) => stored.id === sailor.id);
    if (index >= 0) {
      this.sailors[index] = sailor;
    }
  }

  async findAll(): Promise<Sailor[]> {
    return [...this.sailors];
  }
}
