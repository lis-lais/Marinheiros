export const REPOSITORIES = {
  Sailor: Symbol('SailorRepository')
} as const;

export const MESSAGING = {
  EventPublisher: Symbol('IEventPublisher')
} as const;

export const USE_CASES = {
  RegisterSailor: Symbol('RegisterSailorUseCase'),
  GetSailorById: Symbol('GetSailorByIdUseCase'),
  ListSailors: Symbol('ListSailorsUseCase'),
  AuthenticateSailor: Symbol('AuthenticateSailorUseCase')
} as const;
