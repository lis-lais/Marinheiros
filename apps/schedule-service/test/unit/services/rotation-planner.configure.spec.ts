import { CalendarDate } from '../../../src/domain/value-objects/calendar-date';
import { RotationPlanner } from '../../../src/domain/services/rotation-planner.service';
import { ConfigureRotationInput } from '../../../src/domain/interfaces';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

const TODAY = '2026-11-08';
const INVALID_SCALE = 'A escala deve estar no formato 14x21, com cada lado entre 1 e 366 dias.';
const START_IN_FUTURE = 'A data de início da situação atual não pode ser posterior a hoje.';

function day(iso: string): CalendarDate {
  return CalendarDate.fromIso(iso);
}

function input(overrides: Partial<ConfigureRotationInput> = {}): ConfigureRotationInput {
  return {
    scale: '14x21',
    situation: 'embarked',
    since: '2026-11-01',
    ...overrides,
  };
}

describe('RotationPlanner.configure', () => {
  const planner = new RotationPlanner();
  const today = day(TODAY);

  it('stores the anchor and projects the current and next periods', () => {
    const profile = planner.configure(null, 'sailor-1', input(), today);

    expect(profile.sailorId).toBe('sailor-1');
    expect(profile.situation).toBe('embarked');
    expect(profile.since.toIso()).toBe('2026-11-01');
    expect(profile.scale.toString()).toBe('14x21');
    expect(profile.nextTransitionDate).toBeNull();

    const board = planner.projectBoard(profile, today);

    expect(board.scale).toBe('14x21');
    expect(board.situation).toBe('embarked');
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

  it('accepts a situation that starts today', () => {
    const profile = planner.configure(
      null,
      'sailor-1',
      input({ since: TODAY }),
      today,
    );

    expect(profile.situation).toBe('embarked');
    expect(profile.since.toIso()).toBe(TODAY);
    expect(profile.nextTransitionDate).toBeNull();
  });

  it('accepts the 360x60 scale', () => {
    const profile = planner.configure(
      null,
      'sailor-1',
      input({ scale: '360x60', since: TODAY }),
      today,
    );

    expect(profile.scale.toString()).toBe('360x60');
  });

  it.each(['14-21', '0x21', '14x367', '367x1'])(
    'rejects invalid scale %s',
    (scale) => {
      expect(() =>
        planner.configure(null, 'sailor-1', input({ scale }), today),
      ).toThrow(
        expect.objectContaining({
          code: 'INVALID_SCALE',
          message: INVALID_SCALE,
        }),
      );
      expect(() =>
        planner.configure(null, 'sailor-1', input({ scale }), today),
      ).toThrow(DomainException);
    },
  );

  it('rejects a situation start after today', () => {
    expect(() =>
      planner.configure(null, 'sailor-1', input({ since: '2026-11-09' }), today),
    ).toThrow(
      expect.objectContaining({
        code: 'SITUATION_START_IN_FUTURE',
        message: START_IN_FUTURE,
      }),
    );
    expect(() =>
      planner.configure(null, 'sailor-1', input({ since: '2026-11-09' }), today),
    ).toThrow(DomainException);
  });
});
