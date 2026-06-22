import { InMemorySailorRepository } from './in-memory-sailor.repository';
import { Sailor } from '../../domain/entities/sailor.entity';
import { Name } from '@marinheiros/core';

describe('InMemorySailorRepository', () => {
  it('should store and retrieve sailors', async () => {
    const repository = new InMemorySailorRepository();
    const sailor = new Sailor('s1', new Name('Maria', 'Oliveira'), 'Cabo', 'maria@ocean.com', 'hashed123');

    await repository.create(sailor);
    const found = await repository.findById('s1');

    expect(found).toEqual(sailor);
    expect(await repository.findAll()).toHaveLength(1);
  });
});
