// apps/sailor-service/src/application/use-cases/authenticate-sailor.use-case.test.ts
import { AuthenticateSailorUseCase } from './authenticate-sailor.use-case';
import { SailorRepository } from '../../domain/repositories/sailor.repository';
import { Sailor } from '../../domain/entities/sailor.entity';
import { Name } from '@marinheiros/core';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthenticateSailorUseCase', () => {
  let repository: jest.Mocked<SailorRepository>;
  let useCase: AuthenticateSailorUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new AuthenticateSailorUseCase(repository);
    jest.clearAllMocks();
  });

  it('should authenticate a sailor successfully with correct credentials', async () => {
    const mockSailor = new Sailor(
      'sailor-id',
      new Name('João', 'Silva'),
      'Cabo',
      'marinheiro@ocean.com',
      '$2b$10$hashedpassword123',
      new Date()
    );
    repository.findByEmail.mockResolvedValue(mockSailor);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute('marinheiro@ocean.com', 'SenhaValida123');
    expect(result).toBe(mockSailor);
    expect(bcrypt.compare).toHaveBeenCalledWith('SenhaValida123', '$2b$10$hashedpassword123');
  });

  it('should throw error for invalid password', async () => {
    const mockSailor = new Sailor(
      'sailor-id',
      new Name('João', 'Silva'),
      'Cabo',
      'marinheiro@ocean.com',
      '$2b$10$hashedpassword123',
      new Date()
    );
    repository.findByEmail.mockResolvedValue(mockSailor);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute('marinheiro@ocean.com', 'SenhaErrada')).rejects.toThrow(
      'Credenciais inválidas.'
    );
  });

  it('should throw error for non-existent email', async () => {
    repository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute('inexistente@ocean.com', 'Senha123')).rejects.toThrow(
      'Credenciais inválidas.'
    );
  });
});
