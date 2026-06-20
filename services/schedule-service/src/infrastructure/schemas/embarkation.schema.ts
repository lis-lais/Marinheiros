import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class EmbarkationDocument extends Document {
  
  @Prop({ required: true })
  sailorId!: string;

  @Prop({ required: true })
  vesselName!: string;

  @Prop({ required: true })
  embarkDate!: Date;

  @Prop({ required: true })
  disembarkDate!: Date;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const EmbarkationSchema = SchemaFactory.createForClass(EmbarkationDocument);
