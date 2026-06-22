// apps/schedule-service/src/application/use-cases/get-calendar-projections.use-case.test.ts
import { GetCalendarProjectionsUseCase } from './get-calendar-projections.use-case';
import { SailorScheduleProfileRepository } from '../../domain/repositories/sailor-schedule-profile.repository';
import { SailorScheduleProfile } from '../../domain/entities/sailor-schedule-profile.entity';
import { RotationScale } from '@marinheiros/core';

describe('GetCalendarProjectionsUseCase', () => {
  let repository: jest.Mocked<SailorScheduleProfileRepository>;
  let useCase: GetCalendarProjectionsUseCase;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findBySailorId: jest.fn(),
    } as any;

    useCase = new GetCalendarProjectionsUseCase(repository);
  });

  it('should project schedule correctly for disembarked anchor', async () => {
    const profile = new SailorScheduleProfile(
      'sailor-id',
      new RotationScale(14, 21), // 14 days work, 21 days off
      new Date('2026-06-01T00:00:00Z'), // Anchor date
      'disembarked', // Anchor type
      'Ocean Pearl'
    );
    repository.findBySailorId.mockResolvedValue(profile);

    // Get projections for June 2026 (01/06 to 30/06)
    const result = await useCase.execute('sailor-id', 2026, 6);

    expect(result.length).toBe(30);

    // Days 1 to 21: off-duty (since last event was disembarking on 01/06)
    expect(result[0]).toEqual({ date: '2026-06-01', status: 'off-duty' });
    expect(result[20]).toEqual({ date: '2026-06-21', status: 'off-duty' });

    // Day 22 to 30: embarked (next 14 days)
    expect(result[21]).toEqual({ date: '2026-06-22', status: 'embarked' });
    expect(result[29]).toEqual({ date: '2026-06-30', status: 'embarked' });
  });

  it('should project schedule correctly for embarked anchor', async () => {
    const profile = new SailorScheduleProfile(
      'sailor-id',
      new RotationScale(14, 21),
      new Date('2026-06-01T00:00:00Z'),
      'embarked',
      'Ocean Pearl'
    );
    repository.findBySailorId.mockResolvedValue(profile);

    const result = await useCase.execute('sailor-id', 2026, 6);

    // Days 1 to 14: embarked
    expect(result[0]).toEqual({ date: '2026-06-01', status: 'embarked' });
    expect(result[13]).toEqual({ date: '2026-06-14', status: 'embarked' });

    // Days 15 to 30: off-duty
    expect(result[14]).toEqual({ date: '2026-06-15', status: 'off-duty' });
    expect(result[29]).toEqual({ date: '2026-06-30', status: 'off-duty' });
  });

  it('should throw error if schedule profile does not exist', async () => {
    repository.findBySailorId.mockResolvedValue(null);

    await expect(useCase.execute('sailor-id', 2026, 6)).rejects.toThrow(
      'Perfil de escala não configurado para este marinheiro.'
    );
  });
});
