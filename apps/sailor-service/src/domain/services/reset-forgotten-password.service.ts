import { DomainError } from '@marinheiros/core';
import { Sailor } from '../entities/sailor.entity';
import { ResetForgottenPasswordInput } from '../interfaces';
import { IPasswordHasher } from '../ports/password-hasher.port';
import { SailorRepository } from '../repositories/sailor.repository';

const EMPTY_PASSWORD = 'Informe a senha nova.';
const CONFIRMATION_MISMATCH = 'A confirmação da senha não confere.';
const EMAIL_NOT_FOUND = 'Não encontramos uma conta com esse e-mail.';
const IDENTITY_MISMATCH = 'Os dados não conferem com esta conta.';
const SAME_PASSWORD = 'A senha nova precisa ser diferente da senha atual.';

type PasswordResetStore = Pick<SailorRepository, 'findByNormalizedEmail' | 'update'>;

export class ResetForgottenPasswordService {
  constructor(
    private readonly sailors: PasswordResetStore,
    private readonly passwords: IPasswordHasher,
  ) {}

  async reset(input: ResetForgottenPasswordInput): Promise<void> {
    if (input.newPassword.trim() === '') {
      throw new DomainError(EMPTY_PASSWORD);
    }
    if (input.newPassword !== input.confirmPassword) {
      throw new DomainError(CONFIRMATION_MISMATCH);
    }

    const sailor = await this.sailors.findByNormalizedEmail(this.normalize(input.email));
    if (!sailor) {
      throw new DomainError(EMAIL_NOT_FOUND);
    }
    if (!this.sameIdentity(input.firstName, sailor.name.firstName) || !this.sameIdentity(input.lastName, sailor.name.lastName)) {
      throw new DomainError(IDENTITY_MISMATCH);
    }
    if (await this.passwords.matches(input.newPassword, sailor.passwordHash)) {
      throw new DomainError(SAME_PASSWORD);
    }

    const passwordHash = await this.passwords.hash(input.newPassword);
    await this.sailors.update(sailor.withPasswordHash(passwordHash));
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private sameIdentity(typed: string, stored: string): boolean {
    return this.normalize(typed) === this.normalize(stored);
  }
}
