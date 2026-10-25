import { DomainException } from './domain.exception';

export class ProfileNotConfiguredException extends DomainException {
  constructor(message = 'Perfil de escala não configurado para este marinheiro.') {
    super('PROFILE_NOT_CONFIGURED', message);
  }
}
