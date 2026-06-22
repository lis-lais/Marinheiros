import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SailorScheduleProfile } from '../../domain/entities/sailor-schedule-profile.entity';
import { SailorScheduleProfileRepository } from '../../domain/repositories/sailor-schedule-profile.repository';
import { SailorScheduleProfileDocument } from '../schemas/sailor-schedule-profile.schema';
import { RotationScale } from '@marinheiros/core';

@Injectable()
export class MongooseSailorScheduleProfileRepository implements SailorScheduleProfileRepository {
  constructor(
    @InjectModel('SailorScheduleProfile')
    private readonly model: Model<SailorScheduleProfileDocument>
  ) {}

  async save(profile: SailorScheduleProfile): Promise<void> {
    await this.model.updateOne(
      { sailorId: profile.sailorId },
      {
        sailorId: profile.sailorId,
        rotationScale: profile.scale.toString(),
        lastEventDate: profile.lastEventDate,
        lastEventType: profile.lastEventType,
        vesselName: profile.vesselName,
        updatedAt: profile.updatedAt
      },
      { upsert: true }
    );
  }

  async findBySailorId(sailorId: string): Promise<SailorScheduleProfile | null> {
    const doc = await this.model.findOne({ sailorId }).exec();
    if (!doc) return null;
    return new SailorScheduleProfile(
      doc.sailorId,
      RotationScale.fromString(doc.rotationScale),
      doc.lastEventDate,
      doc.lastEventType as 'embarked' | 'disembarked',
      doc.vesselName,
      doc.updatedAt
    );
  }

  async findAll(): Promise<SailorScheduleProfile[]> {
    const docs = await this.model.find().exec();
    return docs.map(
      (doc) =>
        new SailorScheduleProfile(
          doc.sailorId,
          RotationScale.fromString(doc.rotationScale),
          doc.lastEventDate,
          doc.lastEventType as 'embarked' | 'disembarked',
          doc.vesselName,
          doc.updatedAt
        )
    );
  }
}
