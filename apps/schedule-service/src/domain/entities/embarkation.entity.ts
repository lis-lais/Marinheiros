import { DateRange } from '../value-objects/date-range.vo';

export class Embarkation {
  constructor(
    public readonly id: string,
    public readonly sailorId: string,
    public readonly vesselName: string,
    public readonly period: DateRange,
    public readonly createdAt: Date = new Date()
  ) {}
}
