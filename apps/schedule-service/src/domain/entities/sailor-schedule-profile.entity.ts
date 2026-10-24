import { RotationScale } from '@marinheiros/core';
import { CalendarDate } from '../value-objects/calendar-date';
import { DutySituation } from '../interfaces';

export class SailorScheduleProfile {
  public readonly since: CalendarDate;
  public readonly nextTransitionDate: CalendarDate | null;

  constructor(
    public readonly sailorId: string,
    public readonly scale: RotationScale,
    public readonly lastEventDate: Date,
    public readonly lastEventType: DutySituation,
    public readonly vesselName?: string,
    public readonly updatedAt: Date = new Date(),
    since?: CalendarDate,
    nextTransitionDate: CalendarDate | null = null,
  ) {
    this.since = since ?? CalendarDate.fromUtcDate(lastEventDate);
    this.nextTransitionDate = nextTransitionDate;
  }

  get situation(): DutySituation {
    return this.lastEventType;
  }
}
