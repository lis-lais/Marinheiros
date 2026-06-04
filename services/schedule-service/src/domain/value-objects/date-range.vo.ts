export class DateRange {
  constructor(public readonly startDate: Date, public readonly endDate: Date) {
    if (endDate < startDate) {
      throw new Error('A data de desembarque deve ser posterior à data de embarque.');
    }
  }
}
