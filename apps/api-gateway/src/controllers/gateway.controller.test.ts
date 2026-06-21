import { GatewayController } from './gateway.controller';
import { SailorProxyService } from '../services/sailor-proxy.service';
import { ScheduleProxyService } from '../services/schedule-proxy.service';

const makeSailorProxy = () => ({
  createSailor: jest.fn(),
  listSailors: jest.fn(),
  getSailor: jest.fn()
});

const makeScheduleProxy = () => ({
  createSchedule: jest.fn(),
  listSchedules: jest.fn(),
  getScheduleBySailor: jest.fn()
});

describe('GatewayController', () => {
  let sailorProxy: ReturnType<typeof makeSailorProxy>;
  let scheduleProxy: ReturnType<typeof makeScheduleProxy>;
  let controller: GatewayController;

  beforeEach(() => {
    sailorProxy = makeSailorProxy();
    scheduleProxy = makeScheduleProxy();
    controller = new GatewayController(
      sailorProxy as unknown as SailorProxyService,
      scheduleProxy as unknown as ScheduleProxyService
    );
  });

  it('should forward createSailor request', async () => {
    sailorProxy.createSailor.mockResolvedValue({ id: '1' });
    const result = await controller.createSailor({ firstName: 'João', lastName: 'Silva', rank: 'Cabo' });

    expect(result).toEqual({ id: '1' });
    expect(sailorProxy.createSailor).toHaveBeenCalledWith({ firstName: 'João', lastName: 'Silva', rank: 'Cabo' });
  });

  it('should forward listSailors request', async () => {
    sailorProxy.listSailors.mockResolvedValue([{ id: '1' }]);
    const result = await controller.listSailors();

    expect(result).toEqual([{ id: '1' }]);
  });

  it('should forward getSailor request', async () => {
    sailorProxy.getSailor.mockResolvedValue({ id: '1' });
    const result = await controller.getSailor('1');

    expect(result).toEqual({ id: '1' });
    expect(sailorProxy.getSailor).toHaveBeenCalledWith('1');
  });

  it('should forward createSchedule request', async () => {
    scheduleProxy.createSchedule.mockResolvedValue({ id: 'e1' });
    const result = await controller.createSchedule({ sailorId: 's1' });

    expect(result).toEqual({ id: 'e1' });
    expect(scheduleProxy.createSchedule).toHaveBeenCalledWith({ sailorId: 's1' });
  });

  it('should forward listSchedules request', async () => {
    scheduleProxy.listSchedules.mockResolvedValue([{ id: 'e1' }]);
    const result = await controller.listSchedules();

    expect(result).toEqual([{ id: 'e1' }]);
  });

  it('should forward getScheduleBySailor request', async () => {
    scheduleProxy.getScheduleBySailor.mockResolvedValue([{ id: 'e1' }]);
    const result = await controller.getScheduleBySailor('s1');

    expect(result).toEqual([{ id: 'e1' }]);
    expect(scheduleProxy.getScheduleBySailor).toHaveBeenCalledWith('s1');
  });
});
