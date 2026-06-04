import { InMemorySailorRepository } from '../services/sailor-service/src/infrastructure/repositories/in-memory-sailor.repository';
import { Sailor } from '../services/sailor-service/src/domain/entities/sailor.entity';
import { Name } from '../services/sailor-service/src/domain/value-objects/name.vo';
import { InMemoryEmbarkationRepository } from '../services/schedule-service/src/infrastructure/repositories/in-memory-embarkation.repository';
import { Embarkation } from '../services/schedule-service/src/domain/entities/embarkation.entity';
import { DateRange } from '../services/schedule-service/src/domain/value-objects/date-range.vo';

describe('In-memory repositories', () => {
  it('should store and retrieve sailors', async () => {
    const repository = new InMemorySailorRepository();
    const sailor = new Sailor('s1', new Name('Maria', 'Oliveira'), 'Cabo');

    await repository.create(sailor);
    const found = await repository.findById('s1');

    expect(found).toEqual(sailor);
    expect(await repository.findAll()).toHaveLength(1);
  });

  it('should store and filter embarkation records by sailorId', async () => {
    const repository = new InMemoryEmbarkationRepository();
    const embarkation = new Embarkation('e1', 's1', 'Navio Azul', new DateRange(new Date('2026-06-01'), new Date('2026-06-15')));

    await repository.create(embarkation);
    const found = await repository.findBySailorId('s1');

    expect(found).toHaveLength(1);
    expect(found[0]).toEqual(embarkation);
  });
});
