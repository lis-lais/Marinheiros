import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Embarkation } from '../../domain/entities/embarkation.entity';
import { EmbarkationRepository } from '../../domain/repositories/embarkation.repository';
import { EmbarkationDocument } from '../schemas/embarkation.schema';
import { DateRange } from '../../domain/value-objects/date-range.vo';

@Injectable()
export class MongooseEmbarkationRepository implements EmbarkationRepository {
  constructor(@InjectModel('Embarkation') private readonly model: Model<EmbarkationDocument>) {}

  async create(entry: Embarkation): Promise<void> {
    await this.model.create({
      _id: entry.id,
      sailorId: entry.sailorId,
      vesselName: entry.vesselName,
      embarkDate: entry.period.startDate,
      disembarkDate: entry.period.endDate,
      createdAt: entry.createdAt
    });
  }

  async findBySailorId(sailorId: string): Promise<Embarkation[]> {
    const docs = await this.model.find({ sailorId }).exec();
    return docs.map((d) => new Embarkation(d._id.toString(), d.sailorId, d.vesselName, new DateRange(d.embarkDate, d.disembarkDate), d.createdAt));
  }

  async findAll(): Promise<Embarkation[]> {
    const docs = await this.model.find().exec();
    return docs.map((d) => new Embarkation(d._id.toString(), d.sailorId, d.vesselName, new DateRange(d.embarkDate, d.disembarkDate), d.createdAt));
  }
}
