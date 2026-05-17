import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true })
  propertyId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  guestId: string;

  @Prop({ required: true })
  checkInDate: Date;

  @Prop({ required: true })
  checkOutDate: Date;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true, enum: ['pending', 'confirmed'], default: 'pending' })
  status: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
