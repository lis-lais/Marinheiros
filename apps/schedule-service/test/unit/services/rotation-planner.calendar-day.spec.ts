import { CalendarDate } from '../../../src/domain/value-objects/calendar-date';
import { RotationPlanner } from '../../../src/domain/services/rotation-planner.service';
import { DomainException } from '../../../src/domain/exceptions/domain.exception';

const PROFILE_NOT_CONFIGURED = 'Perfil de escala não configurado para este marinheiro.';

function day(iso: string): CalendarDate {
  return CalendarDate.fromIso(iso);
}

describe('RotationPlanner.periodOn', () => {
  const planner = new RotationPlanner();
  const today = day('2026-11-08');
  const profile = planner.configure(null, 'sailor-1', {
    scale: '14x21',
    situation: 'embarked',
    since: '2026-11-01',
  }, today);

  it('places a day inside the current embark', () => {
    expect(planner.periodOn(profile, day('2026-11-08'))).toEqual({
      kind: 'embarked',
      start: '2026-11-01',
      end: '2026-11-14',
      dayCount: 14,
    });
  });

  it('places a day inside the following disembark', () => {
    expect(planner.periodOn(profile, day('2026-11-20'))).toEqual({
      kind: 'disembarked',
      start: '2026-11-15',
      end: '2026-12-05',
      dayCount: 21,
    });
  });

  it('returns null for a day before the rotation starts', () => {
    expect(planner.periodOn(profile, day('2026-10-31'))).toBeNull();
  });

  it('rejects a day lookup when the sailor has no profile', () => {
    expect(() => planner.periodOn(null, day('2026-11-08'))).toThrow(
      expect.objectContaining({
        code: 'PROFILE_NOT_CONFIGURED',
        message: PROFILE_NOT_CONFIGURED,
      }),
    );
    expect(() => planner.periodOn(null, day('2026-11-08'))).toThrow(DomainException);
  });
});
