import { Name } from '@marinheiros/core';

export class Sailor {
  constructor(
    public readonly id: string,
    public readonly name: Name,
    public readonly rank: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
