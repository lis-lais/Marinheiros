import { SailorScheduleProfile } from '../entities/sailor-schedule-profile.entity';

export interface SailorScheduleProfileRepository {
  save(profile: SailorScheduleProfile): Promise<void>;
  findBySailorId(sailorId: string): Promise<SailorScheduleProfile | null>;
  findAll(): Promise<SailorScheduleProfile[]>;
}
