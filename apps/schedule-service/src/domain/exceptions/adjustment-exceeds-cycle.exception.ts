import { DomainException } from './domain.exception';

export class AdjustmentExceedsCycleException extends DomainException {
  constructor(message = 'O ajuste passa de um ciclo da escala. Refaça a configuração com a situação atual e a data real de início.') {
    super('ADJUSTMENT_EXCEEDS_CYCLE', message);
  }
}
