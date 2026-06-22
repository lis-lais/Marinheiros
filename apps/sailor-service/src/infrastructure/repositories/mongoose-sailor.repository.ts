import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sailor } from '../../domain/entities/sailor.entity';
import { SailorRepository } from '../../domain/repositories/sailor.repository';
import { SailorDocument } from '../schemas/sailor.schema';
import { Name } from '@marinheiros/core';

@Injectable()
export class MongooseSailorRepository implements SailorRepository {
  constructor(@InjectModel('Sailor') private readonly model: Model<SailorDocument>) {}

  async create(sailor: Sailor): Promise<void> {
    await this.model.create({
      _id: sailor.id,
      firstName: sailor.name.firstName,
      lastName: sailor.name.lastName,
      rank: sailor.rank,
      email: sailor.email,
      passwordHash: sailor.passwordHash,
      createdAt: sailor.createdAt
    });
  }

  async findById(id: string): Promise<Sailor | null> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return null;
    return new Sailor(doc._id.toString(), new Name(doc.firstName, doc.lastName), doc.rank, doc.email, doc.passwordHash, doc.createdAt);
  }

  async findByEmail(email: string): Promise<Sailor | null> {
    const doc = await this.model.findOne({ email }).exec();
    if (!doc) return null;
    return new Sailor(doc._id.toString(), new Name(doc.firstName, doc.lastName), doc.rank, doc.email, doc.passwordHash, doc.createdAt);
  }

  async findAll(): Promise<Sailor[]> {
    const docs = await this.model.find().exec();
    return docs.map((d) => new Sailor(d._id.toString(), new Name(d.firstName, d.lastName), d.rank, d.email, d.passwordHash, d.createdAt));
  }
}
