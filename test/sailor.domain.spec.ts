import { Name } from '../services/sailor-service/src/domain/value-objects/name.vo';
import { Sailor } from '../services/sailor-service/src/domain/entities/sailor.entity';

describe('Sailor domain', () => {
  it('should build the full name correctly', () => {
    const name = new Name('João', 'Silva');
    const sailor = new Sailor('1', name, 'Marinheiro');

    expect(sailor.name.fullName).toBe('João Silva');
  });

  it('should throw if missing name or surname', () => {
    expect(() => new Name('', 'Silva')).toThrow('O nome do marinheiro deve conter nome e sobrenome.');
    expect(() => new Name('João', '')).toThrow('O nome do marinheiro deve conter nome e sobrenome.');
  });
});
