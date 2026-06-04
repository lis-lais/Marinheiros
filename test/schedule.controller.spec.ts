import { ScheduleController } from '../services/schedule-service/src/infrastructure/controllers/schedule.controller';
import { ScheduleService } from '../services/schedule-service/src/application/services/schedule.service';
import { Embarkation } from '../services/schedule-service/src/domain/entities/embarkation.entity';
import { DateRange } from '../services/schedule-service/src/domain/value-objects/date-range.vo';

const makeScheduleService = () => ({
  scheduleEmbarkation: jest.fn(),
  getEmbarkationsForSailor: jest.fn(),
  listAllEmbarkations: jest.fn()
});

describe('ScheduleController', () => {
  let scheduleService: ReturnType<typeof makeScheduleService>;
  let controller: ScheduleController;

  beforeEach(() => {
    scheduleService = makeScheduleService();
    controller = new ScheduleController(scheduleService as unknown as ScheduleService);
  });

  it('should create a schedule and return mapped response', async () => {
    const embarkation = new Embarkation(
      'e1',
      's1',
      'Navio Azul',
      new DateRange(new Date('2026-06-01'), new Date('2026-06-10'))
    );
    scheduleService.scheduleEmbarkation.mockResolvedValue(embarkation);

    const result = await controller.create({
      sailorId: 's1',
      vesselName: 'Navio Azul',
      embarkDate: '2026-06-01',
      disembarkDate: '2026-06-10'
    });

    expect(result).toEqual({
      id: 'e1',
      sailorId: 's1',
      vesselName: 'Navio Azul',
      embarkDate: embarkation.period.startDate,
      disembarkDate: embarkation.period.endDate,
      createdAt: embarkation.createdAt
    });
  });

  it('should map embarkations for a sailor', async () => {
    const embarkation = new Embarkation(
      'e2',
      's2',
      'Navio Verde',
      new DateRange(new Date('2026-07-01'), new Date('2026-07-15'))
    );
    scheduleService.getEmbarkationsForSailor.mockResolvedValue([embarkation]);

    const result = await controller.getBySailor('s2');

    expect(result).toEqual([
      {
        id: 'e2',
        sailorId: 's2',
        vesselName: 'Navio Verde',
        embarkDate: embarkation.period.startDate,
        disembarkDate: embarkation.period.endDate,
        createdAt: embarkation.createdAt
      }
    ]);
  });

  it('should list all schedules', async () => {
    const embarkation = new Embarkation(
      'e3',
      's3',
      'Navio Vermelho',
      new DateRange(new Date('2026-08-01'), new Date('2026-08-20'))
    );
    scheduleService.listAllEmbarkations.mockResolvedValue([embarkation]);

    const result = await controller.list();

    expect(result).toEqual([
      {
        id: 'e3',
        sailorId: 's3',
        vesselName: 'Navio Vermelho',
        embarkDate: embarkation.period.startDate,
        disembarkDate: embarkation.period.endDate,
        createdAt: embarkation.createdAt
      }
    ]);
  });
});
