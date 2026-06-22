export const REPOSITORIES = {
  Embarkation: Symbol('EmbarkationRepository'),
  SailorScheduleProfile: Symbol('SailorScheduleProfileRepository'),
  PendingConfirmation: Symbol('PendingConfirmationRepository')
} as const;

export const USE_CASES = {
  ScheduleEmbarkation: Symbol('ScheduleEmbarkationUseCase'),
  GetEmbarkationsForSailor: Symbol('GetEmbarkationsForSailorUseCase'),
  ListAllEmbarkations: Symbol('ListAllEmbarkationsUseCase'),
  UpdateScheduleProfile: Symbol('UpdateScheduleProfileUseCase'),
  GetCalendarProjections: Symbol('GetCalendarProjectionsUseCase'),
  ConfirmTransition: Symbol('ConfirmTransitionUseCase')
} as const;
