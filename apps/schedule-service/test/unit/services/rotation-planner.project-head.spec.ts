import { RotationScale } from '@marinheiros/core';
import { CalendarDate } from '../../../src/domain/value-objects/calendar-date';
import { RotationPlanner } from '../../../src/domain/services/rotation-planner.service';
import { SailorScheduleProfile } from '../../../src/domain/entities/sailor-schedule-profile.entity';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

const TODAY = '2026-11-08';
const PROFILE_NOT_CONFIGURED = 'Perfil de escala não configurado para este marinheiro.';

function day(iso: string): CalendarDate {
  return CalendarDate.fromIso(iso);
}

function embarkedProfile(): SailorScheduleProfile {
  return {
    sailorId: 'sailor-1',
    scale: RotationScale.fromString('14x21'),
    situation: 'embarked',
    since: day('2026-11-01'),
    nextTransitionDate: null,
    closedPeriods: [],
  } as unknown as SailorScheduleProfile;
}

describe('RotationPlanner.projectBoard', () => {
  const planner = new RotationPlanner();

  it('projects the current embarked period and the following disembarked period', () => {
    const board = planner.projectBoard(embarkedProfile(), day(TODAY));

    expect(board.scale).toBe('14x21');
    expect(board.situation).toBe('embarked');
    expect(board.today).toBe(TODAY);
    expect(board.daysRemaining).toBe(6);
    expect(board.currentPeriod).toEqual({
      kind: 'embarked',
      start: '2026-11-01',
      end: '2026-11-14',
      dayCount: 14,
    });
    expect(board.nextPeriod).toEqual({
      kind: 'disembarked',
      start: '2026-11-15',
      end: '2026-12-05',
      dayCount: 21,
    });
  });

  it('rejects the board when the sailor has no profile', () => {
    expect(() => planner.projectBoard(null, day(TODAY))).toThrow(
      expect.objectContaining({
        code: 'PROFILE_NOT_CONFIGURED',
        message: PROFILE_NOT_CONFIGURED,
      }),
    );
    expect(() => planner.projectBoard(null, day(TODAY))).toThrow(DomainException);
  });
});
