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

describe('SailorController', () => {
  let registerUseCase: ReturnType<typeof makeRegisterSailorUseCase>;
  let getByIdUseCase: ReturnType<typeof makeGetSailorByIdUseCase>;
  let listUseCase: ReturnType<typeof makeListSailorsUseCase>;
  let controller: SailorController;

  beforeEach(() => {
    registerUseCase = makeRegisterSailorUseCase();
    getByIdUseCase = makeGetSailorByIdUseCase();
    listUseCase = makeListSailorsUseCase();
    controller = new SailorController(
      registerUseCase as any,
      getByIdUseCase as any,
      listUseCase as any
    );
  });

  it('should create a sailor and return response dto', async () => {
    const sailor = new Sailor('1', new Name('João', 'Silva'), 'Cabo');
    registerUseCase.execute.mockResolvedValue(sailor);

    const result = await controller.create({ firstName: 'João', lastName: 'Silva', rank: 'Cabo' });

    expect(result).toEqual({
      id: '1',
      fullName: 'João Silva',
      rank: 'Cabo',
      createdAt: sailor.createdAt
    });
    expect(registerUseCase.execute).toHaveBeenCalledWith('João', 'Silva', 'Cabo');
  });

  it('should throw NotFoundException when sailor not found', async () => {
    getByIdUseCase.execute.mockResolvedValue(null);
    await expect(controller.getById('1')).rejects.toThrow('Marinheiro não encontrado.');
  });

  it('should list sailors', async () => {
    const sailor = new Sailor('2', new Name('Maria', 'Oliveira'), 'Marinheira');
    listUseCase.execute.mockResolvedValue([sailor]);
    const result = await controller.list();

    expect(result).toEqual([
      {
        id: '2',
        fullName: 'Maria Oliveira',
        rank: 'Marinheira',
        createdAt: sailor.createdAt
      }
    ]);
  });
});
