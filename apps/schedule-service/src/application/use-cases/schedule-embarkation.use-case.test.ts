import { ScheduleEmbarkationUseCase } from './schedule-embarkation.use-case';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';
import { Embarkation } from '../../domain/entities/embarkation.entity';
import { DomainError } from '@marinheiros/core';

describe('ScheduleEmbarkationUseCase', () => {
  let repository: jest.Mocked<EmbarkationRepository>;
  let useCase: ScheduleEmbarkationUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findBySailorId: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new ScheduleEmbarkationUseCase(repository);
  });

  it('should schedule embarkation successfully', async () => {
    const embarkation = await useCase.execute(
      'sailor-1',
      'Vapor-Alpha',
      '2026-07-01',
      '2026-07-15'
    );

    expect(embarkation).toBeInstanceOf(Embarkation);
    expect(embarkation.sailorId).toBe('sailor-1');
    expect(embarkation.vesselName).toBe('Vapor-Alpha');
    expect(repository.create).toHaveBeenCalledWith(embarkation);
  });

  it('should throw DomainError when disembark date is before embark date', async () => {
    await expect(
      useCase.execute('sailor-1', 'Vapor-Alpha', '2026-07-15', '2026-07-01')
    ).rejects.toThrow(DomainError);
  });
});
