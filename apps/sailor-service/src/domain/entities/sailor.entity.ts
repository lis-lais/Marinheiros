import { Name } from '@marinheiros/core';

export class Sailor {
  constructor(
    public readonly id: string,
    public readonly name: Name,
    public readonly rank: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date = new Date()
  ) {}

  withPasswordHash(passwordHash: string): Sailor {
    return new Sailor(this.id, this.name, this.rank, this.email, passwordHash, this.createdAt);
  }
}
