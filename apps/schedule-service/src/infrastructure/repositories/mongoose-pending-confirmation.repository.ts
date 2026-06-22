import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PendingConfirmation } from '../../domain/entities/pending-confirmation.entity';
import { PendingConfirmationRepository } from '../../domain/repositories/pending-confirmation.repository';
import { PendingConfirmationDocument } from '../schemas/pending-confirmation.schema';

@Injectable()
export class MongoosePendingConfirmationRepository implements PendingConfirmationRepository {
  constructor(
    @InjectModel('PendingConfirmation')
    private readonly model: Model<PendingConfirmationDocument>
  ) {}

  async save(entry: PendingConfirmation): Promise<void> {
    await this.model.updateOne(
      { _id: entry.id },
      {
        _id: entry.id,
        sailorId: entry.sailorId,
        scheduledDate: entry.scheduledDate,
        transitionType: entry.transitionType,
        status: entry.status,
        createdAt: entry.createdAt
      },
      { upsert: true }
    );
  }

  async findById(id: string): Promise<PendingConfirmation | null> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return null;
    return new PendingConfirmation(
      doc._id.toString(),
      doc.sailorId,
      doc.scheduledDate,
      doc.transitionType as 'embark' | 'disembark',
      doc.status as 'pending' | 'confirmed' | 'retified',
      doc.createdAt
    );
  }

  async findPendingBySailorId(sailorId: string): Promise<PendingConfirmation[]> {
    const docs = await this.model.find({ sailorId, status: 'pending' }).exec();
    return docs.map(
      (doc) =>
        new PendingConfirmation(
          doc._id.toString(),
          doc.sailorId,
          doc.scheduledDate,
          doc.transitionType as 'embark' | 'disembark',
          doc.status as 'pending' | 'confirmed' | 'retified',
          doc.createdAt
        )
    );
  }

  async findAll(): Promise<PendingConfirmation[]> {
    const docs = await this.model.find().exec();
    return docs.map(
      (doc) =>
        new PendingConfirmation(
          doc._id.toString(),
          doc.sailorId,
          doc.scheduledDate,
          doc.transitionType as 'embark' | 'disembark',
          doc.status as 'pending' | 'confirmed' | 'retified',
          doc.createdAt
        )
    );
  }
}
