import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PendingConfirmationDocument extends Document {
  @Prop({ type: String })
  override _id!: string;
  @Prop({ required: true })
  sailorId!: string;

  @Prop({ required: true })
  scheduledDate!: Date;

  @Prop({ required: true, enum: ['embark', 'disembark'] })
  transitionType!: string;

  @Prop({ required: true, enum: ['pending', 'confirmed', 'retified'], default: 'pending' })
  status!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const PendingConfirmationSchema = SchemaFactory.createForClass(PendingConfirmationDocument);
