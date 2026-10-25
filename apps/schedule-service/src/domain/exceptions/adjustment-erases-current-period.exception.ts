import { DomainException } from './domain.exception';

export class AdjustmentErasesCurrentPeriodException extends DomainException {
  constructor(message = 'A nova data precisa deixar pelo menos 1 dia no período atual.') {
    super('ADJUSTMENT_ERASES_CURRENT_PERIOD', message);
  }
}
