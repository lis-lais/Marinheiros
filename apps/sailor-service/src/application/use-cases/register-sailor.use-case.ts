import { randomUUID } from 'crypto';
import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';
import { Name } from '@marinheiros/core';
import { IEventPublisher } from '../../domain/ports/event-publisher.interface';

import * as bcrypt from 'bcryptjs';

export class RegisterSailorUseCase {
  constructor(
    private readonly repository: SailorRepository,
    private readonly publisher?: IEventPublisher
  ) {}

  async execute(firstName: string, lastName: string, rank: string, email: string, password: string): Promise<Sailor> {
    const passwordHash = await bcrypt.hash(password, 10);
    const sailor = new Sailor(randomUUID(), new Name(firstName, lastName), rank, email, passwordHash);
    await this.repository.create(sailor);
    if (this.publisher) {
      try {
        await this.publisher.publish('sailor.created', {
          id: sailor.id,
          fullName: sailor.name.fullName,
          rank: sailor.rank,
          email: sailor.email
        });
      } catch (e) {
        // swallowing to keep behavior resilient when broker unavailable
      }
    }
    return sailor;
  }
}
