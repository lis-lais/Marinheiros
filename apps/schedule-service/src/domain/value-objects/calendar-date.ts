import { InvalidCalendarDateException } from '../exceptions/invalid-calendar-date.exception';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_IN_MS = 86_400_000;

export class CalendarDate {
  private constructor(
    private readonly year: number,
    private readonly month: number,
    private readonly day: number,
  ) {}

  static fromIso(iso: string): CalendarDate {
    const match = ISO_DATE.exec(iso);
    if (!match) {
      throw new InvalidCalendarDateException();
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const probe = new Date(Date.UTC(year, month - 1, day));
    const roundTrip =
      probe.getUTCFullYear() === year &&
      probe.getUTCMonth() === month - 1 &&
      probe.getUTCDate() === day;
    if (!roundTrip) {
      throw new InvalidCalendarDateException();
    }
    return new CalendarDate(year, month, day);
  }

  static fromUtcDate(instant: Date): CalendarDate {
    return new CalendarDate(
      instant.getUTCFullYear(),
      instant.getUTCMonth() + 1,
      instant.getUTCDate(),
    );
  }

  toIso(): string {
    const month = String(this.month).padStart(2, '0');
    const day = String(this.day).padStart(2, '0');
    return `${this.year}-${month}-${day}`;
  }

  toUtcNoon(): Date {
    return new Date(Date.UTC(this.year, this.month - 1, this.day, 15, 0, 0));
  }

  addDays(days: number): CalendarDate {
    const shifted = new Date(this.toEpochMs() + days * DAY_IN_MS);
    return CalendarDate.fromUtcDate(shifted);
  }

  diffDays(earlier: CalendarDate): number {
    return Math.round((this.toEpochMs() - earlier.toEpochMs()) / DAY_IN_MS);
  }

  isAfter(other: CalendarDate): boolean {
    return this.toIso() > other.toIso();
  }

  private toEpochMs(): number {
    return Date.UTC(this.year, this.month - 1, this.day);
  }
}
