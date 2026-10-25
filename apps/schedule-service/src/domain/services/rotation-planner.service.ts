import { DomainError, RotationScale } from '@marinheiros/core';
import { SailorScheduleProfile } from '../entities/sailor-schedule-profile.entity';
import { AdjustmentDateRequiredException } from '../exceptions/adjustment-date-required.exception';
import { AdjustmentErasesCurrentPeriodException } from '../exceptions/adjustment-erases-current-period.exception';
import { AdjustmentExceedsCycleException } from '../exceptions/adjustment-exceeds-cycle.exception';
import { InvalidScaleException } from '../exceptions/invalid-scale.exception';
import { ProfileNotConfiguredException } from '../exceptions/profile-not-configured.exception';
import { SituationStartInFutureException } from '../exceptions/situation-start-in-future.exception';
import {
  AdjustmentPreview,
  ConfigureRotationInput,
  DutyPeriod,
  DutySituation,
  RotationBoard,
  RotationCycle,
} from '../interfaces';
import { CalendarDate } from '../value-objects/calendar-date';

const INVALID_SCALE_MESSAGE = 'A escala deve estar no formato 14x21, com cada lado entre 1 e 366 dias.';
const PERIODS_FOR_THREE_CYCLES = 8;

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
      [],
    );
  }

  projectBoard(profile: SailorScheduleProfile | null, today: CalendarDate): RotationBoard {
    const schedule = this.requireProfile(profile);
    const periods = this.periods(schedule);
    const currentPeriod = periods[0];
    const nextPeriod = periods[1];
    const currentEnd = CalendarDate.fromIso(currentPeriod.end);
    const planned = CalendarDate.fromIso(nextPeriod.start);

    return {
      scale: schedule.scale.toString(),
      vesselName: schedule.vesselName ?? null,
      today: today.toIso(),
      situation: schedule.situation,
      daysRemaining: Math.max(0, currentEnd.diffDays(today)),
      currentPeriod,
      nextPeriod,
      upcomingCycles: this.upcomingCycles(currentPeriod, periods),
      confirmation: {
        required: !planned.isAfter(today),
        plannedDate: nextPeriod.start,
        transition: schedule.situation === 'embarked' ? 'disembark' : 'embark',
      },
    };
  }

  periodOn(profile: SailorScheduleProfile | null, day: CalendarDate): DutyPeriod | null {
    const schedule = this.requireProfile(profile);
    const closed = this.closedPeriods(schedule).find((block) => this.contains(block, day));
    if (closed) {
      return closed;
    }
    if (!day.isAfter(schedule.since) && day.toIso() !== schedule.since.toIso()) {
      return null;
    }
    return this.periods(schedule).find((block) => this.contains(block, day)) ?? null;
  }

  previewAdjustment(
    profile: SailorScheduleProfile | null,
    today: CalendarDate,
    transitionDate: CalendarDate | null,
  ): AdjustmentPreview {
    const adjusted = this.commitAdjustment(profile, today, transitionDate);
    return { persisted: false, board: this.projectBoard(adjusted, today) };
  }

  commitAdjustment(
    profile: SailorScheduleProfile | null,
    today: CalendarDate,
    transitionDate: CalendarDate | null,
  ): SailorScheduleProfile {
    const schedule = this.requireProfile(profile);
    this.assertTransition(schedule, transitionDate);
    if (transitionDate.isAfter(today)) {
      return this.copyProfile(schedule, schedule.situation, schedule.since, transitionDate, this.closedPeriods(schedule));
    }
    const closed = this.period(schedule.situation, schedule.since, transitionDate.addDays(-1));
    const flipped: DutySituation = schedule.situation === 'embarked' ? 'disembarked' : 'embarked';
    return this.copyProfile(schedule, flipped, transitionDate, null, [...this.closedPeriods(schedule), closed]);
  }

  private requireProfile(profile: SailorScheduleProfile | null): SailorScheduleProfile {
    if (!profile) {
      throw new ProfileNotConfiguredException();
    }
    return profile;
  }

  private assertTransition(
    profile: SailorScheduleProfile,
    transitionDate: CalendarDate | null,
  ): asserts transitionDate is CalendarDate {
    if (!transitionDate) {
      throw new AdjustmentDateRequiredException();
    }
    if (!transitionDate.isAfter(profile.since)) {
      throw new AdjustmentErasesCurrentPeriodException();
    }
    const planned = this.plannedTransition(profile);
    const distance = Math.abs(transitionDate.diffDays(planned));
    const cycleLength = profile.scale.onDutyDays + profile.scale.offDutyDays;
    if (distance > cycleLength) {
      throw new AdjustmentExceedsCycleException();
    }
  }

  private plannedTransition(profile: SailorScheduleProfile): CalendarDate {
    if (profile.nextTransitionDate) {
      return profile.nextTransitionDate;
    }
    const phaseLength = profile.situation === 'embarked'
      ? profile.scale.onDutyDays
      : profile.scale.offDutyDays;
    return profile.since.addDays(phaseLength);
  }

  private periods(profile: SailorScheduleProfile): DutyPeriod[] {
    const planned = this.plannedTransition(profile);
    const blocks = [this.period(profile.situation, profile.since, planned.addDays(-1))];
    let start = planned;
    let kind: DutySituation = profile.situation === 'embarked' ? 'disembarked' : 'embarked';
    while (blocks.length < PERIODS_FOR_THREE_CYCLES) {
      const length = kind === 'embarked' ? profile.scale.onDutyDays : profile.scale.offDutyDays;
      const end = start.addDays(length - 1);
      blocks.push(this.period(kind, start, end));
      start = end.addDays(1);
      kind = kind === 'embarked' ? 'disembarked' : 'embarked';
    }
    return blocks;
  }

  private upcomingCycles(currentPeriod: DutyPeriod, periods: DutyPeriod[]): RotationCycle[] {
    const cycles: RotationCycle[] = [];
    let pendingEmbark: DutyPeriod | null = null;
    for (const block of periods.slice(1)) {
      if (block.kind === 'embarked' && block.start > currentPeriod.end) {
        pendingEmbark = block;
      } else if (pendingEmbark && block.kind === 'disembarked') {
        cycles.push({ embarked: pendingEmbark, disembarked: block });
        pendingEmbark = null;
        if (cycles.length === 3) {
          break;
        }
      }
    }
    return cycles;
  }

  private contains(block: DutyPeriod, day: CalendarDate): boolean {
    const iso = day.toIso();
    return block.start <= iso && iso <= block.end;
  }

  private closedPeriods(profile: SailorScheduleProfile): readonly DutyPeriod[] {
    return profile.closedPeriods ?? [];
  }

  private copyProfile(
    profile: SailorScheduleProfile,
    situation: DutySituation,
    since: CalendarDate,
    nextTransitionDate: CalendarDate | null,
    closedPeriods: readonly DutyPeriod[],
  ): SailorScheduleProfile {
    return new SailorScheduleProfile(
      profile.sailorId,
      profile.scale,
      since.toUtcNoon(),
      situation,
      profile.vesselName,
      profile.updatedAt,
      since,
      nextTransitionDate,
      closedPeriods,
    );
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
