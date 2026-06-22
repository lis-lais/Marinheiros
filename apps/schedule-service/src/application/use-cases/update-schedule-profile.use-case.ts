import { SailorScheduleProfileRepository } from '../../domain/repositories/sailor-schedule-profile.repository';
import { SailorScheduleProfile } from '../../domain/entities/sailor-schedule-profile.entity';
import { RotationScale, DomainError } from '@marinheiros/core';

export class UpdateScheduleProfileUseCase {
  constructor(
    private readonly profileRepository: SailorScheduleProfileRepository
  ) {}

  async execute(input: {
    sailorId: string;
    scale: string;
    lastEventDate: Date;
    lastEventType: 'embarked' | 'disembarked';
    vesselName?: string;
  }): Promise<SailorScheduleProfile> {
    const rotationScale = RotationScale.fromString(input.scale);
    
    // Ensure anchor date is not in the future
    if (input.lastEventDate > new Date()) {
      throw new DomainError('A data do último evento não pode ser no futuro.');
    }

    const profile = new SailorScheduleProfile(
      input.sailorId,
      rotationScale,
      input.lastEventDate,
      input.lastEventType,
      input.vesselName,
      new Date()
    );

    await this.profileRepository.save(profile);
    return profile;
  }
}
