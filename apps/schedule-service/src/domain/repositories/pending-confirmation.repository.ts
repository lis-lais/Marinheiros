import { PendingConfirmation } from '../entities/pending-confirmation.entity';

export interface PendingConfirmationRepository {
  save(entry: PendingConfirmation): Promise<void>;
  findById(id: string): Promise<PendingConfirmation | null>;
  findPendingBySailorId(sailorId: string): Promise<PendingConfirmation[]>;
  findAll(): Promise<PendingConfirmation[]>;
}
