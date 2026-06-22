// apps/schedule-service/src/application/use-cases/confirm-transition.use-case.test.ts
import { ConfirmTransitionUseCase } from './confirm-transition.use-case';
import { SailorScheduleProfileRepository } from '../../domain/repositories/sailor-schedule-profile.repository';
import { PendingConfirmationRepository } from '../../domain/repositories/pending-confirmation.repository';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';
import { SailorScheduleProfile } from '../../domain/entities/sailor-schedule-profile.entity';
import { PendingConfirmation } from '../../domain/entities/pending-confirmation.entity';
import { RotationScale } from '@marinheiros/core';

describe('ConfirmTransitionUseCase', () => {
  let profileRepo: jest.Mocked<SailorScheduleProfileRepository>;
  let pendingRepo: jest.Mocked<PendingConfirmationRepository>;
  let embarkationRepo: jest.Mocked<EmbarkationRepository>;
  let useCase: ConfirmTransitionUseCase;

  beforeEach(() => {
    profileRepo = {
      save: jest.fn(),
      findBySailorId: jest.fn(),
    } as any;

    pendingRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findPendingBySailorId: jest.fn(),
    } as any;

    embarkationRepo = {
      create: jest.fn(),
      findBySailorId: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new ConfirmTransitionUseCase(profileRepo, pendingRepo, embarkationRepo);
  });

  it('should confirm embarkation transition and update profile/history', async () => {
    const mockProfile = new SailorScheduleProfile(
      'sailor-id',
      new RotationScale(14, 21),
      new Date('2026-06-01T00:00:00Z'),
      'disembarked',
      'Ocean Pearl'
    );
    profileRepo.findBySailorId.mockResolvedValue(mockProfile);

    const mockPending = new PendingConfirmation(
      'pending-id',
      'sailor-id',
      new Date('2026-06-22T00:00:00Z'),
      'embark',
      'pending',
      new Date()
    );
    pendingRepo.findById.mockResolvedValue(mockPending);

    const actualDate = new Date('2026-06-23T00:00:00Z'); // Delayed by 1 day

    await useCase.execute('sailor-id', 'pending-id', actualDate);

    // Should save updated profile with new anchor date/type
    expect(profileRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        sailorId: 'sailor-id',
        lastEventDate: actualDate,
        lastEventType: 'embarked'
      })
    );

    // Should create a history embarkation entry
    expect(embarkationRepo.create).toHaveBeenCalled();

    // Should save updated pending transition to status 'confirmed' (or 'retified')
    expect(pendingRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'pending-id',
        status: 'retified'
      })
    );
  });

  it('should throw error if pending confirmation is not found', async () => {
    pendingRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('sailor-id', 'non-existent-id', new Date())
    ).rejects.toThrow('Confirmação pendente não encontrada.');
  });
});
