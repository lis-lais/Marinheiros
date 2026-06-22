// apps/sailor-service/src/infrastructure/controllers/sailor.controller.test.ts
import { SailorController } from './sailor.controller';
import { Sailor } from '../../domain/entities/sailor.entity';
import { Name } from '@marinheiros/core';

const makeRegisterSailorUseCase = () => ({
  execute: jest.fn()
});
const makeGetSailorByIdUseCase = () => ({
  execute: jest.fn()
});
const makeListSailorsUseCase = () => ({
  execute: jest.fn()
});
const makeAuthenticateSailorUseCase = () => ({
  execute: jest.fn()
});

describe('SailorController', () => {
  let registerUseCase: ReturnType<typeof makeRegisterSailorUseCase>;
  let getByIdUseCase: ReturnType<typeof makeGetSailorByIdUseCase>;
  let listUseCase: ReturnType<typeof makeListSailorsUseCase>;
  let authenticateUseCase: ReturnType<typeof makeAuthenticateSailorUseCase>;
  let controller: SailorController;

  beforeEach(() => {
    registerUseCase = makeRegisterSailorUseCase();
    getByIdUseCase = makeGetSailorByIdUseCase();
    listUseCase = makeListSailorsUseCase();
    authenticateUseCase = makeAuthenticateSailorUseCase();
    controller = new SailorController(
      registerUseCase as any,
      getByIdUseCase as any,
      listUseCase as any,
      authenticateUseCase as any
    );
  });

  it('should create a sailor and return response dto', async () => {
    const sailor = new Sailor('1', new Name('João', 'Silva'), 'Cabo', 'joao@ocean.com', 'hashed123');
    registerUseCase.execute.mockResolvedValue(sailor);

    const result = await controller.create({
      firstName: 'João',
      lastName: 'Silva',
      rank: 'Cabo',
      email: 'joao@ocean.com',
      password: 'SenhaValida123'
    });

    expect(result).toEqual({
      id: '1',
      fullName: 'João Silva',
      rank: 'Cabo',
      email: 'joao@ocean.com',
      createdAt: sailor.createdAt
    });
    expect(registerUseCase.execute).toHaveBeenCalledWith('João', 'Silva', 'Cabo', 'joao@ocean.com', 'SenhaValida123');
  });

  it('should authenticate a sailor and return response dto', async () => {
    const sailor = new Sailor('1', new Name('João', 'Silva'), 'Cabo', 'joao@ocean.com', 'hashed123');
    authenticateUseCase.execute.mockResolvedValue(sailor);

    const result = await controller.authenticate({
      email: 'joao@ocean.com',
      password: 'SenhaValida123'
    });

    expect(result).toEqual({
      id: '1',
      fullName: 'João Silva',
      rank: 'Cabo',
      email: 'joao@ocean.com',
      createdAt: sailor.createdAt
    });
    expect(authenticateUseCase.execute).toHaveBeenCalledWith('joao@ocean.com', 'SenhaValida123');
  });

  it('should throw NotFoundException when sailor not found', async () => {
    getByIdUseCase.execute.mockResolvedValue(null);
    await expect(controller.getById('1')).rejects.toThrow('Marinheiro não encontrado.');
  });

  it('should list sailors', async () => {
    const sailor = new Sailor('2', new Name('Maria', 'Oliveira'), 'Marinheira', 'maria@ocean.com', 'hashed123');
    listUseCase.execute.mockResolvedValue([sailor]);
    const result = await controller.list();

    expect(result).toEqual([
      {
        id: '2',
        fullName: 'Maria Oliveira',
        rank: 'Marinheira',
        email: 'maria@ocean.com',
        createdAt: sailor.createdAt
      }
    ]);
  });
});
