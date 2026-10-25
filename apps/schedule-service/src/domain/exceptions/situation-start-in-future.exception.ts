import { DomainException } from './domain.exception';

export class SituationStartInFutureException extends DomainException {
  constructor(message = 'A data de início da situação atual não pode ser posterior a hoje.') {
    super('SITUATION_START_IN_FUTURE', message);
  }
}
