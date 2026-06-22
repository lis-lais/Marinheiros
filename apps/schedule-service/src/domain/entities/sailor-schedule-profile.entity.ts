import { RotationScale } from '@marinheiros/core';

export class SailorScheduleProfile {
  constructor(
    public readonly sailorId: string,
    public readonly scale: RotationScale,
    public readonly lastEventDate: Date,
    public readonly lastEventType: 'embarked' | 'disembarked',
    public readonly vesselName?: string,
    public readonly updatedAt: Date = new Date()
  ) {}
}
