export class PendingConfirmation {
  constructor(
    public readonly id: string,
    public readonly sailorId: string,
    public readonly scheduledDate: Date,
    public readonly transitionType: 'embark' | 'disembark',
    public readonly status: 'pending' | 'confirmed' | 'retified',
    public readonly createdAt: Date = new Date()
  ) {}
}
