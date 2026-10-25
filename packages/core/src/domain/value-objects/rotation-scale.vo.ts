import { DomainError } from '../errors/domain.error';

export class RotationScale {
  constructor(
    public readonly onDutyDays: number,
    public readonly offDutyDays: number
  ) {
    if (onDutyDays <= 0 || offDutyDays <= 0) {
      throw new DomainError('Os dias de trabalho e folga devem ser maiores que zero.');
    }
  }

  static fromString(value: string): RotationScale {
    const regex = /^(\d+)x(\d+)$/;
    const match = value.match(regex);
    if (!match) {
      throw new DomainError('A escala de trabalho deve estar no formato XxY (ex: 14x21).');
    }
    const onDuty = parseInt(match[1], 10);
    const offDuty = parseInt(match[2], 10);
    if (onDuty > 366 || offDuty > 366) {
      throw new DomainError('A escala deve estar no formato 14x21, com cada lado entre 1 e 366 dias.');
    }
    return new RotationScale(onDuty, offDuty);
  }

  toString(): string {
    return `${this.onDutyDays}x${this.offDutyDays}`;
  }
}
