import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ type: [String], default: [] })
  keywords: string[];
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
FaqSchema.index({ question: 'text', keywords: 'text' });
