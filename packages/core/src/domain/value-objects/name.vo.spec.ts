import { Name } from './name.vo';

describe('Name Value Object', () => {
  it('should build the full name correctly', () => {
    const name = new Name('João', 'Silva');
    expect(name.fullName).toBe('João Silva');
  });

  it('should throw DomainError if missing first name or last name', () => {
    expect(() => new Name('', 'Silva')).toThrow('O nome do marinheiro deve conter nome e sobrenome.');
    expect(() => new Name('João', '')).toThrow('O nome do marinheiro deve conter nome e sobrenome.');
  });
});
