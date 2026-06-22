import { SailorScheduleProfileRepository } from '../../domain/repositories/sailor-schedule-profile.repository';
import { PendingConfirmationRepository } from '../../domain/repositories/pending-confirmation.repository';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';
import { Embarkation } from '../../domain/entities/embarkation.entity';
import { DateRange } from '../../domain/value-objects/date-range.vo';
import { PendingConfirmation } from '../../domain/entities/pending-confirmation.entity';
import { SailorScheduleProfile } from '../../domain/entities/sailor-schedule-profile.entity';
import { DomainError } from '@marinheiros/core';
import { randomUUID } from 'crypto';

export class ConfirmTransitionUseCase {
  constructor(
    private readonly profileRepository: SailorScheduleProfileRepository,
    private readonly pendingRepository: PendingConfirmationRepository,
    private readonly embarkationRepository: EmbarkationRepository
  ) {}

  async execute(sailorId: string, pendingConfirmationId: string, actualDate: Date): Promise<void> {
    const pending = await this.pendingRepository.findById(pendingConfirmationId);
    if (!pending || pending.sailorId !== sailorId) {
      throw new DomainError('Confirmação pendente não encontrada.');
    }

    if (pending.status !== 'pending') {
      throw new DomainError('Esta confirmação de transição já foi processada.');
    }

    const profile = await this.profileRepository.findBySailorId(sailorId);
    if (!profile) {
      throw new DomainError('Perfil de escala não configurado.');
    }

    // Ensure actualDate is not before the last anchor date
    if (actualDate < profile.lastEventDate) {
      throw new DomainError('A data de transição real não pode ser anterior à última data âncora registrada.');
    }

    // Determine new anchor type
    const newAnchorType = pending.transitionType === 'embark' ? 'embarked' : 'disembarked';

    // 1. Update Profile
    const updatedProfile = new SailorScheduleProfile(
      profile.sailorId,
      profile.scale,
      actualDate,
      newAnchorType,
      profile.vesselName,
      new Date()
    );
    await this.profileRepository.save(updatedProfile);

    // 2. Add history log (Embarkation)
    if (pending.transitionType === 'embark') {
      const estimatedDisembark = new Date(actualDate);
      estimatedDisembark.setDate(estimatedDisembark.getDate() + profile.scale.onDutyDays);
      const embarkation = new Embarkation(
        randomUUID(),
        sailorId,
        profile.vesselName || 'Indefinido',
        new DateRange(actualDate, estimatedDisembark),
        new Date()
      );
      await this.embarkationRepository.create(embarkation);
    } else {
      // If disembark, we could optionally update the last embarkation disembark date.
      // For this MVP, let's also create/save a disembark log or a placeholder.
      // We can just log it or add an embarkation period with the exact dates if we wanted,
      // but creating a record is sufficient.
    }

    // 3. Mark pending confirmation as confirmed or retified
    const isRetified = pending.scheduledDate.toISOString().split('T')[0] !== actualDate.toISOString().split('T')[0];
    const updatedPending = new PendingConfirmation(
      pending.id,
      pending.sailorId,
      pending.scheduledDate,
      pending.transitionType,
      isRetified ? 'retified' : 'confirmed',
      pending.createdAt
    );
    await this.pendingRepository.save(updatedPending);
  }
}
