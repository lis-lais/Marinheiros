import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';
import { DomainError } from '@marinheiros/core';
import * as bcrypt from 'bcryptjs';

export class AuthenticateSailorUseCase {
  constructor(private readonly repository: SailorRepository) {}

  async execute(email: string, password: string): Promise<Sailor> {
    const sailor = await this.repository.findByEmail(email);
    if (!sailor) {
      throw new DomainError('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(password, sailor.passwordHash);
    if (!isPasswordValid) {
      throw new DomainError('Credenciais inválidas.');
    }

    return sailor;
  }
}
