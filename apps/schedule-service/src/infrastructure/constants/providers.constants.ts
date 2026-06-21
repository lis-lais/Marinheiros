export const REPOSITORIES = {
  Embarkation: Symbol('EmbarkationRepository')
} as const;

export const USE_CASES = {
  ScheduleEmbarkation: Symbol('ScheduleEmbarkationUseCase'),
  GetEmbarkationsForSailor: Symbol('GetEmbarkationsForSailorUseCase'),
  ListAllEmbarkations: Symbol('ListAllEmbarkationsUseCase')
} as const;
