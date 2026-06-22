// packages/core/src/domain/value-objects/rotation-scale.vo.spec.ts
import { RotationScale } from './rotation-scale.vo';

describe('RotationScale Value Object', () => {
  it('should parse valid scale string correctly', () => {
    const scale1 = RotationScale.fromString('14x21');
    expect(scale1.onDutyDays).toBe(14);
    expect(scale1.offDutyDays).toBe(21);
    expect(scale1.toString()).toBe('14x21');

    const scale2 = RotationScale.fromString('42x42');
    expect(scale2.onDutyDays).toBe(42);
    expect(scale2.offDutyDays).toBe(42);
  });

  it('should throw DomainError for invalid scale strings', () => {
    expect(() => RotationScale.fromString('14-21')).toThrow('A escala de trabalho deve estar no formato XxY (ex: 14x21).');
    expect(() => RotationScale.fromString('abc')).toThrow('A escala de trabalho deve estar no formato XxY (ex: 14x21).');
    expect(() => RotationScale.fromString('14x')).toThrow('A escala de trabalho deve estar no formato XxY (ex: 14x21).');
    expect(() => RotationScale.fromString('x21')).toThrow('A escala de trabalho deve estar no formato XxY (ex: 14x21).');
    expect(() => RotationScale.fromString('-14x21')).toThrow('A escala de trabalho deve estar no formato XxY (ex: 14x21).');
  });
});
