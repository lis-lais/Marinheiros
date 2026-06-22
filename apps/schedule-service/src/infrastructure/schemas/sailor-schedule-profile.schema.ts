import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SailorScheduleProfileDocument extends Document {
  @Prop({ required: true, unique: true })
  sailorId!: string;

  @Prop({ required: true })
  rotationScale!: string; // stored as string "14x21"

  @Prop({ required: true })
  lastEventDate!: Date;

  @Prop({ required: true, enum: ['embarked', 'disembarked'] })
  lastEventType!: string;

  @Prop()
  vesselName?: string;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const SailorScheduleProfileSchema = SchemaFactory.createForClass(SailorScheduleProfileDocument);
