import { RegisterSailorUseCase } from './register-sailor.use-case';
import { SailorRepository } from '../../domain/repositories/sailor.repository';
import { IEventPublisher } from '../../domain/ports/event-publisher.interface';
import { Sailor } from '../../domain/entities/sailor.entity';
import { Name } from '@marinheiros/core';

describe('RegisterSailorUseCase', () => {
  let repository: jest.Mocked<SailorRepository>;
  let publisher: jest.Mocked<IEventPublisher>;
  let useCase: RegisterSailorUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    publisher = {
      publish: jest.fn(),
    };

    useCase = new RegisterSailorUseCase(repository, publisher);
  });

  it('should register a sailor successfully and publish event', async () => {
    const sailor = await useCase.execute('João', 'Silva', 'Cabo');

    expect(sailor).toBeInstanceOf(Sailor);
    expect(sailor.name).toBeInstanceOf(Name);
    expect(sailor.name.fullName).toBe('João Silva');
    expect(sailor.rank).toBe('Cabo');
    expect(repository.create).toHaveBeenCalledWith(sailor);
    expect(publisher.publish).toHaveBeenCalledWith('sailor.created', {
      id: sailor.id,
      fullName: 'João Silva',
      rank: 'Cabo',
    });
  });

  it('should register a sailor even if publisher fails (resilience)', async () => {
    publisher.publish.mockRejectedValue(new Error('RabbitMQ down'));

    const sailor = await useCase.execute('João', 'Silva', 'Cabo');

    expect(sailor.name.fullName).toBe('João Silva');
    expect(repository.create).toHaveBeenCalledWith(sailor);
  });
});
