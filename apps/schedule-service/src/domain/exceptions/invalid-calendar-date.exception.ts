import { DomainException } from './domain.exception';

export class InvalidCalendarDateException extends DomainException {
  constructor(message = 'Data de calendário inválida.') {
    super('INVALID_CALENDAR_DATE', message);
  }
}
