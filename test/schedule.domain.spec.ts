import { DateRange } from '../services/schedule-service/src/domain/value-objects/date-range.vo';

describe('Schedule domain', () => {
  it('should create a date range when embark date is before disembark date', () => {
    const range = new DateRange(new Date('2026-06-01'), new Date('2026-06-10'));

    expect(range.startDate.toISOString()).toBe(new Date('2026-06-01').toISOString());
    expect(range.endDate.toISOString()).toBe(new Date('2026-06-10').toISOString());
  });

  it('should throw if disembark date is before embark date', () => {
    expect(() => new DateRange(new Date('2026-06-10'), new Date('2026-06-01')))
      .toThrow('A data de desembarque deve ser posterior à data de embarque.');
  });
});
