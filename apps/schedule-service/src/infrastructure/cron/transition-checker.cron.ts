import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SailorScheduleProfileRepository } from '../../domain/repositories/sailor-schedule-profile.repository';
import { PendingConfirmationRepository } from '../../domain/repositories/pending-confirmation.repository';
import { PendingConfirmation } from '../../domain/entities/pending-confirmation.entity';
import { REPOSITORIES } from '../constants/providers.constants';
import { randomUUID } from 'crypto';
import { logger } from '../../utils/structured-logger';

@Injectable()
export class TransitionCheckerCron {
  constructor(
    @Inject(REPOSITORIES.SailorScheduleProfile)
    private readonly profileRepo: SailorScheduleProfileRepository,
    @Inject(REPOSITORIES.PendingConfirmation)
    private readonly pendingRepo: PendingConfirmationRepository
  ) {}

  // Run daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    await this.checkTransitions();
  }

  async checkTransitions() {
    logger.info('Starting scheduled transition checking...');
    const profiles = await this.profileRepo.findAll();
    const today = new Date();

    for (const profile of profiles) {
      const onDuty = profile.scale.onDutyDays;
      const offDuty = profile.scale.offDutyDays;

      // Calculate next transition date
      const nextTransitionDate = new Date(profile.lastEventDate);
      let transitionType: 'embark' | 'disembark';

      if (profile.lastEventType === 'disembarked') {
        nextTransitionDate.setDate(nextTransitionDate.getDate() + offDuty);
        transitionType = 'embark';
      } else {
        nextTransitionDate.setDate(nextTransitionDate.getDate() + onDuty);
        transitionType = 'disembark';
      }

      // Check if we are at or past the transition date
      if (today >= nextTransitionDate) {
        // Check if pending confirmation already exists for this date/type
        const existingPendings = await this.pendingRepo.findPendingBySailorId(profile.sailorId);
        const alreadyExists = existingPendings.some(
          (p) =>
            p.transitionType === transitionType &&
            p.scheduledDate.toISOString().split('T')[0] === nextTransitionDate.toISOString().split('T')[0]
        );

        if (!alreadyExists) {
          logger.info(`Creating pending transition for sailor ${profile.sailorId}`, {
            transitionType,
            scheduledDate: nextTransitionDate
          });
          const pending = new PendingConfirmation(
            randomUUID(),
            profile.sailorId,
            nextTransitionDate,
            transitionType,
            'pending',
            new Date()
          );
          await this.pendingRepo.save(pending);
        }
      }
    }
    logger.info('Transition checking completed.');
  }
}
