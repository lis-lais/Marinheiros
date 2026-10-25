import { CalendarDate } from '../../../src/domain/value-objects/calendar-date';
import { RotationPlanner } from '../../../src/domain/services/rotation-planner.service';
import { DutyPeriod, RotationCycle } from '../../../src/domain/interfaces';

function day(iso: string): CalendarDate {
  return CalendarDate.fromIso(iso);
}

function period(kind: DutyPeriod['kind'], start: string, end: string, dayCount: number): DutyPeriod {
  return { kind, start, end, dayCount };
}

function cycle(embarked: DutyPeriod, disembarked: DutyPeriod): RotationCycle {
  return { embarked, disembarked };
}

const FOLLOWING_CYCLES: RotationCycle[] = [
  cycle(
    period('embarked', '2026-12-06', '2026-12-19', 14),
    period('disembarked', '2026-12-20', '2027-01-09', 21),
  ),
  cycle(
    period('embarked', '2027-01-10', '2027-01-23', 14),
    period('disembarked', '2027-01-24', '2027-02-13', 21),
  ),
  cycle(
    period('embarked', '2027-02-14', '2027-02-27', 14),
    period('disembarked', '2027-02-28', '2027-03-20', 21),
  ),
];

describe('RotationPlanner.projectBoard upcoming cycles', () => {
  const planner = new RotationPlanner();

  it('lists the three cycles that start after the current embarked period', () => {
    const today = day('2026-11-08');
    const profile = planner.configure(null, 'sailor-1', {
      scale: '14x21',
      situation: 'embarked',
      since: '2026-11-01',
    }, today);

    const board = planner.projectBoard(profile, today);

    expect(board.upcomingCycles).toEqual(FOLLOWING_CYCLES);
  });

  it('starts the three cycles at the next embark when the sailor is already disembarked', () => {
    const today = day('2026-11-20');
    const profile = planner.configure(null, 'sailor-1', {
      scale: '14x21',
      situation: 'disembarked',
      since: '2026-11-15',
    }, today);

    const board = planner.projectBoard(profile, today);

    expect(board.upcomingCycles).toEqual(FOLLOWING_CYCLES);
  });
});
