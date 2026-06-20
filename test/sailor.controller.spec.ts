import { SailorController } from '../services/sailor-service/src/infrastructure/controllers/sailor.controller';
import { SailorService } from '../services/sailor-service/src/application/services/sailor.service';
import { Sailor } from '../services/sailor-service/src/domain/entities/sailor.entity';
import { Name } from '../services/sailor-service/src/domain/value-objects/name.vo';

const makeSailorService = () => ({
  registerSailor: jest.fn(),
  getSailorById: jest.fn(),
  listSailors: jest.fn()
});

describe('SailorController', () => {
  let sailorService: ReturnType<typeof makeSailorService>;
  let controller: SailorController;

  beforeEach(() => {
    sailorService = makeSailorService();
    controller = new SailorController(sailorService as unknown as SailorService);
  });

  it('should create a sailor and return response dto', async () => {
    const sailor = new Sailor('1', new Name('João', 'Silva'), 'Cabo');
    sailorService.registerSailor.mockResolvedValue(sailor);

    const result = await controller.create({ firstName: 'João', lastName: 'Silva', rank: 'Cabo' });

    expect(result).toEqual({
      id: '1',
      fullName: 'João Silva',
      rank: 'Cabo',
      createdAt: sailor.createdAt
    });
    expect(sailorService.registerSailor).toHaveBeenCalledWith('João', 'Silva', 'Cabo');
  });

  it('should throw NotFoundException when sailor not found', async () => {
    sailorService.getSailorById.mockResolvedValue(null);
    await expect(controller.getById('1')).rejects.toThrow('Marinheiro não encontrado.');
  });

  it('should list sailors', async () => {
    const sailor = new Sailor('2', new Name('Maria', 'Oliveira'), 'Marinheira');
    sailorService.listSailors.mockResolvedValue([sailor]);
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
