import { CalendarDate } from '../../../src/domain/value-objects/calendar-date';
import { RotationPlanner } from '../../../src/domain/services/rotation-planner.service';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';
import { DutyPeriod } from '../../../src/domain/interfaces';

const DATE_REQUIRED = 'Informe a nova data da troca.';
const ERASES_CURRENT = 'A nova data precisa deixar pelo menos 1 dia no período atual.';
const EXCEEDS_CYCLE = 'O ajuste passa de um ciclo da escala. Refaça a configuração com a situação atual e a data real de início.';

function day(iso: string): CalendarDate {
  return CalendarDate.fromIso(iso);
}

function period(kind: DutyPeriod['kind'], start: string, end: string, dayCount: number): DutyPeriod {
  return { kind, start, end, dayCount };
}

describe('RotationPlanner adjustment', () => {
  const planner = new RotationPlanner();
  const today = day('2026-11-08');

  function baseProfile() {
    return planner.configure(null, 'sailor-1', {
      scale: '14x21',
      situation: 'embarked',
      since: '2026-11-01',
    }, today);
  }

  function expectDomainError(run: () => void, code: string, message: string) {
    expect(run).toThrow(expect.objectContaining({ code, message }));
    expect(run).toThrow(DomainException);
  }

  it('previews a delayed disembark without saving it', () => {
    const profile = baseProfile();
    const preview = planner.previewAdjustment(profile, today, day('2026-11-18'));

    expect(preview.persisted).toBe(false);
    expect(preview.board.currentPeriod).toEqual(period('embarked', '2026-11-01', '2026-11-17', 17));
    expect(preview.board.nextPeriod).toEqual(period('disembarked', '2026-11-18', '2026-12-08', 21));
    expect(preview.board.upcomingCycles[0].embarked.start).toBe('2026-12-09');

    const unchanged = planner.projectBoard(profile, today);
    expect(unchanged.nextPeriod.start).toBe('2026-11-15');
    expect(profile.nextTransitionDate).toBeNull();
  });

  it('commits the delayed disembark and keeps the same previewed board', () => {
    const profile = baseProfile();
    const preview = planner.previewAdjustment(profile, today, day('2026-11-18'));
    const committed = planner.commitAdjustment(profile, today, day('2026-11-18'));

    expect(committed.situation).toBe('embarked');
    expect(committed.since.toIso()).toBe('2026-11-01');
    expect(committed.nextTransitionDate?.toIso()).toBe('2026-11-18');
    expect(planner.projectBoard(committed, today)).toEqual(preview.board);
  });

  it('flips the phase when the planned transition date is confirmed', () => {
    const profile = baseProfile();
    const confirmationDay = day('2026-11-15');
    const committed = planner.commitAdjustment(profile, confirmationDay, confirmationDay);
    const board = planner.projectBoard(committed, confirmationDay);

    expect(committed.situation).toBe('disembarked');
    expect(committed.since.toIso()).toBe('2026-11-15');
    expect(committed.nextTransitionDate).toBeNull();
    expect(committed.closedPeriods).toEqual([
      period('embarked', '2026-11-01', '2026-11-14', 14),
    ]);
    expect(board.currentPeriod).toEqual(period('disembarked', '2026-11-15', '2026-12-05', 21));
    expect(board.nextPeriod).toEqual(period('embarked', '2026-12-06', '2026-12-19', 14));
    expect(board.confirmation.required).toBe(false);
  });

  it('keeps the planned board and asks for confirmation when the transition day passes', () => {
    const profile = baseProfile();
    const board = planner.projectBoard(profile, day('2026-11-15'));

    expect(board.situation).toBe('embarked');
    expect(board.daysRemaining).toBe(0);
    expect(board.confirmation.required).toBe(true);
    expect(board.currentPeriod).toEqual(period('embarked', '2026-11-01', '2026-11-14', 14));
    expect(board.nextPeriod).toEqual(period('disembarked', '2026-11-15', '2026-12-05', 21));
  });

  it('rejects a missing transition date', () => {
    const profile = baseProfile();
    expectDomainError(
      () => planner.previewAdjustment(profile, today, null),
      'ADJUSTMENT_DATE_REQUIRED',
      DATE_REQUIRED,
    );
    expectDomainError(
      () => planner.commitAdjustment(profile, today, null),
      'ADJUSTMENT_DATE_REQUIRED',
      DATE_REQUIRED,
    );
  });

  it('rejects a transition that leaves the current period empty', () => {
    const profile = baseProfile();
    expectDomainError(
      () => planner.commitAdjustment(profile, today, day('2026-11-01')),
      'ADJUSTMENT_ERASES_CURRENT_PERIOD',
      ERASES_CURRENT,
    );
  });

  it('reports an erased period before a cycle overflow', () => {
    const profile = baseProfile();
    expectDomainError(
      () => planner.commitAdjustment(profile, today, day('2026-10-01')),
      'ADJUSTMENT_ERASES_CURRENT_PERIOD',
      ERASES_CURRENT,
    );
  });

  it('rejects a transition more than one cycle away from the plan', () => {
    const profile = baseProfile();
    expectDomainError(
      () => planner.commitAdjustment(profile, today, day('2026-12-21')),
      'ADJUSTMENT_EXCEEDS_CYCLE',
      EXCEEDS_CYCLE,
    );
  });

  it('accepts a transition exactly one cycle away from the plan', () => {
    const profile = baseProfile();
    const committed = planner.commitAdjustment(profile, today, day('2026-12-20'));

    expect(committed.situation).toBe('embarked');
    expect(committed.since.toIso()).toBe('2026-11-01');
    expect(committed.nextTransitionDate?.toIso()).toBe('2026-12-20');
  });
});
