import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SailorDocument extends Document {
  @Prop({ type: String })
  override _id!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  rank!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const SailorSchema = SchemaFactory.createForClass(SailorDocument);
