import { DomainError } from '@marinheiros/core';

export class DateRange {
  constructor(public readonly startDate: Date, public readonly endDate: Date) {
    if (endDate < startDate) {
      throw new DomainError('A data de desembarque deve ser posterior à data de embarque.');
    }
  }
}
