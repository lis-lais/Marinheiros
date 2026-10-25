import { DomainException } from './domain.exception';

export class InvalidScaleException extends DomainException {
  constructor(message = 'Escala de trabalho inválida.') {
    super('INVALID_SCALE', message);
  }
}
