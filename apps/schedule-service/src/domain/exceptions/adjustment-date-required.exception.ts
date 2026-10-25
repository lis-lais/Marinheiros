import { DomainException } from './domain.exception';

export class AdjustmentDateRequiredException extends DomainException {
  constructor(message = 'Informe a nova data da troca.') {
    super('ADJUSTMENT_DATE_REQUIRED', message);
  }
}
