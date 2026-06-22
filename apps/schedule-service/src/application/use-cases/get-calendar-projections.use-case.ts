import { SailorScheduleProfileRepository } from '../../domain/repositories/sailor-schedule-profile.repository';
import { DomainError } from '@marinheiros/core';

export class GetCalendarProjectionsUseCase {
  constructor(
    private readonly profileRepository: SailorScheduleProfileRepository
  ) {}

  async execute(sailorId: string, year: number, month: number): Promise<{ date: string; status: 'embarked' | 'off-duty' }[]> {
    const profile = await this.profileRepository.findBySailorId(sailorId);
    if (!profile) {
      throw new DomainError('Perfil de escala não configurado para este marinheiro.');
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0)); // Last day of month

    const daysCount = endDate.getUTCDate();
    const projections: { date: string; status: 'embarked' | 'off-duty' }[] = [];

    const onDuty = profile.scale.onDutyDays;
    const offDuty = profile.scale.offDutyDays;
    const cycleLength = onDuty + offDuty;

    for (let day = 1; day <= daysCount; day++) {
      const currentDate = new Date(Date.UTC(year, month - 1, day));
      
      // Calculate diff in days
      const diffMs = currentDate.getTime() - profile.lastEventDate.getTime();
      let diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let cycleDay = diffDays % cycleLength;
      if (cycleDay < 0) {
        cycleDay = (cycleDay + cycleLength) % cycleLength;
      }

      let status: 'embarked' | 'off-duty' = 'off-duty';
      if (profile.lastEventType === 'disembarked') {
        // Starts with off-duty days
        if (cycleDay < offDuty) {
          status = 'off-duty';
        } else {
          status = 'embarked';
        }
      } else {
        // Starts with embarked days
        if (cycleDay < onDuty) {
          status = 'embarked';
        } else {
          status = 'off-duty';
        }
      }

      const dateStr = currentDate.toISOString().split('T')[0];
      projections.push({ date: dateStr, status });
    }

    return projections;
  }
}
