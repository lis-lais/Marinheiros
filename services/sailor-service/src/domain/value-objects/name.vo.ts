import { DomainError } from '../errors/domain.error';

export class Name {
  constructor(public readonly firstName: string, public readonly lastName: string) {
    if (!firstName || !lastName) {
      throw new DomainError('O nome do marinheiro deve conter nome e sobrenome.');
    }
  }

  get fullName(): string {
    return `${this.firstName.trim()} ${this.lastName.trim()}`;
  }
}
