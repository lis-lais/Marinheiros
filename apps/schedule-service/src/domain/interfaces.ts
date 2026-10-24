export type DutySituation = 'embarked' | 'disembarked';
export type TransitionKind = 'embark' | 'disembark';

export interface DutyPeriod {
  kind: DutySituation;
  start: string;
  end: string;
  dayCount: number;
}

export interface RotationCycle {
  embarked: DutyPeriod;
  disembarked: DutyPeriod;
}

export interface TransitionConfirmation {
  required: boolean;
  plannedDate: string;
  transition: TransitionKind;
}

export interface RotationBoard {
  scale: string;
  vesselName: string | null;
  today: string;
  situation: DutySituation;
  daysRemaining: number;
  currentPeriod: DutyPeriod;
  nextPeriod: DutyPeriod;
  upcomingCycles: RotationCycle[];
  confirmation: TransitionConfirmation;
}

export interface ConfigureRotationInput {
  scale: string;
  situation: DutySituation;
  since: string;
  vesselName?: string;
}

export type SchedulePhase = 'embarked' | 'off-duty' | 'pending-confirmation';
export type TransitionType = 'embark' | 'disembark';

export interface IScaleConfig {
  onDutyDays: number;
  offDutyDays: number;
}

export interface ITransitionNotificationPayload {
  sailorId: string;
  status: SchedulePhase;
  nextTransitionType: TransitionType;
  nextTransitionDate: string;
  daysRemaining: number;
  message: string;
}

export interface INextTransitionSummary {
  sailorId: string;
  currentStatus: SchedulePhase;
  nextTransitionType: TransitionType;
  nextTransitionDate: string;
  daysRemaining: number;
  message: string;
  isPendingConfirmation: boolean;
}
