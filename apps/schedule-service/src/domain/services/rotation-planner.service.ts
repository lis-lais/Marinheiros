import { DomainError, RotationScale } from '@marinheiros/core';
import { SailorScheduleProfile } from '../entities/sailor-schedule-profile.entity';
import { InvalidScaleException } from '../exceptions/invalid-scale.exception';
import { ProfileNotConfiguredException } from '../exceptions/profile-not-configured.exception';
import { SituationStartInFutureException } from '../exceptions/situation-start-in-future.exception';
import {
  ConfigureRotationInput,
  DutyPeriod,
  DutySituation,
  RotationBoard,
} from '../interfaces';
import { CalendarDate } from '../value-objects/calendar-date';

const INVALID_SCALE_MESSAGE = 'A escala deve estar no formato 14x21, com cada lado entre 1 e 366 dias.';

export class RotationPlanner {
  configure(
    current: SailorScheduleProfile | null,
    sailorId: string,
    rotationInput: ConfigureRotationInput,
    today: CalendarDate,
  ): SailorScheduleProfile {
    void current;
    const scale = this.parseScale(rotationInput.scale);
    const since = CalendarDate.fromIso(rotationInput.since);
    if (since.isAfter(today)) {
      throw new SituationStartInFutureException();
    }
    const anchorInstant = since.toUtcNoon();
    return new SailorScheduleProfile(
      sailorId,
      scale,
      anchorInstant,
      rotationInput.situation,
      rotationInput.vesselName,
      anchorInstant,
      since,
      null,
    );
  }

  projectBoard(profile: SailorScheduleProfile | null, today: CalendarDate): RotationBoard {
    if (!profile) {
      throw new ProfileNotConfiguredException();
    }

    const currentLength = profile.situation === 'embarked'
      ? profile.scale.onDutyDays
      : profile.scale.offDutyDays;
    const nextLength = profile.situation === 'embarked'
      ? profile.scale.offDutyDays
      : profile.scale.onDutyDays;
    const nextSituation: DutySituation = profile.situation === 'embarked' ? 'disembarked' : 'embarked';

    const currentEnd = profile.since.addDays(currentLength - 1);
    const nextStart = currentEnd.addDays(1);
    const nextEnd = nextStart.addDays(nextLength - 1);

    return {
      scale: profile.scale.toString(),
      vesselName: profile.vesselName ?? null,
      today: today.toIso(),
      situation: profile.situation,
      daysRemaining: Math.max(0, currentEnd.diffDays(today)),
      currentPeriod: this.period(profile.situation, profile.since, currentEnd),
      nextPeriod: this.period(nextSituation, nextStart, nextEnd),
      upcomingCycles: [],
      confirmation: {
        required: false,
        plannedDate: nextStart.toIso(),
        transition: profile.situation === 'embarked' ? 'disembark' : 'embark',
      },
    };
  }

  private parseScale(scale: string): RotationScale {
    try {
      return RotationScale.fromString(scale);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new InvalidScaleException(INVALID_SCALE_MESSAGE);
      }
      throw error;
    }
  }

  private period(kind: DutySituation, start: CalendarDate, end: CalendarDate): DutyPeriod {
    return {
      kind,
      start: start.toIso(),
      end: end.toIso(),
      dayCount: end.diffDays(start) + 1,
    };
  }
}
