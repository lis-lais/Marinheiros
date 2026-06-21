import { InMemoryEmbarkationRepository } from './in-memory-embarkation.repository';
import { Embarkation } from '../../domain/entities/embarkation.entity';
import { DateRange } from '../../domain/value-objects/date-range.vo';

describe('InMemoryEmbarkationRepository', () => {
  it('should store and filter embarkation records by sailorId', async () => {
    const repository = new InMemoryEmbarkationRepository();
    const embarkation = new Embarkation('e1', 's1', 'Navio Azul', new DateRange(new Date('2026-06-01'), new Date('2026-06-15')));

    await repository.create(embarkation);
    const found = await repository.findBySailorId('s1');

    expect(found).toHaveLength(1);
    expect(found[0]).toEqual(embarkation);
  });
});
